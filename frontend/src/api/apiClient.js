const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:8080';

const listeners = new Set();

export const subscribeTo401 = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify401 = () => {
  listeners.forEach((listener) => listener());
};

// In-memory CSRF token storage (strictly memory-only; never saved to localStorage or sessionStorage)
let inMemoryCsrfToken = null;
let csrfInitPromise = null;

export const setInMemoryCsrfToken = (token) => {
  inMemoryCsrfToken = token;
};

export const getInMemoryCsrfToken = () => inMemoryCsrfToken;

export const getCsrfInitPromise = () => csrfInitPromise;

export const clearInMemoryCsrfToken = () => {
  inMemoryCsrfToken = null;
  csrfInitPromise = null;
};

/**
 * Fetch CSRF token from backend.
 * Uses a singleton promise to avoid duplicate /csrf requests during the same initialization cycle.
 * Backend sets HttpOnly cookie __Host-XSRF-TOKEN and returns JSON { csrfToken: string }.
 */
export const fetchCsrfToken = async () => {
  if (csrfInitPromise) {
    return csrfInitPromise;
  }

  csrfInitPromise = (async () => {
    try {
      // Backend AuthController has @GetMapping("/csrf") under @RequestMapping("/auth") -> /auth/csrf
      let response = await fetch(`${API_BASE_URL}/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Forward/backward compatibility fallback in case endpoint is mapped at /csrf
      if (response.status === 404) {
        response = await fetch(`${API_BASE_URL}/csrf`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw { response: { data: errorData, status: response.status } };
      }

      const data = await response.json();
      const token = data?.csrfToken || data?.token || null;
      inMemoryCsrfToken = token;
      return token;
    } catch (err) {
      inMemoryCsrfToken = null;
      throw err;
    } finally {
      csrfInitPromise = null;
    }
  })();

  return csrfInitPromise;
};

/**
 * State-changing methods require the CSRF token.
 * Safe methods (GET, HEAD, OPTIONS) do not require the CSRF token.
 */
const isStateChangingMethod = (method) => {
  const m = (method || 'GET').toUpperCase();
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m);
};

/**
 * Public endpoints where CSRF token is not required or not yet initialized
 */
const isCsrfExemptEndpoint = (url) => {
  return (
    url.endsWith('/auth/login') ||
    url.endsWith('/auth/register') ||
    url.endsWith('/auth/forgot-password')
  );
};

export const request = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = isStateChangingMethod(method);
  const isExempt = isCsrfExemptEndpoint(url);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach CSRF token strictly to state-changing requests (POST, PUT, PATCH, DELETE)
  if (isStateChanging) {
    if (!isExempt) {
      // Any POST, PUT, PATCH, or DELETE request must await this promise if CSRF initialization is still pending
      if (csrfInitPromise) {
        try {
          await csrfInitPromise;
        } catch {
          // Handled below if token remains unavailable
        }
      }

      // If token is missing and no promise is pending, attempt initialization once
      if (!inMemoryCsrfToken) {
        try {
          await fetchCsrfToken();
        } catch {
          // Handled below if token remains unavailable
        }
      }

      // Do not silently send an unsafe state-changing request without the CSRF token
      if (!inMemoryCsrfToken) {
        throw new Error('CSRF token is unavailable. State-changing request aborted for security.');
      }

      headers['X-XSRF-TOKEN'] = inMemoryCsrfToken;
    } else if (inMemoryCsrfToken) {
      // For exempt endpoints, attach token if already present in memory
      headers['X-XSRF-TOKEN'] = inMemoryCsrfToken;
    }
  }

  // All requests automatically include credentials (cookies)
  const fetchOptions = {
    ...options,
    credentials: options.credentials || 'include',
    headers,
  };

  const response = await fetch(url, fetchOptions);

  // Handle unauthorized response globally, excluding login, register, and CSRF check
  if (
    response.status === 401 &&
    !url.endsWith('/auth/login') &&
    !url.endsWith('/auth/register') &&
    !url.endsWith('/auth/csrf') &&
    !url.endsWith('/csrf')
  ) {
    notify401();
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData, status: 401 } };
  }

  // Handle 403 Forbidden due to CSRF validation failure (e.g. CSRF token expired)
  // Note: Do not automatically retry every 403 response because 403 can also indicate authorization restrictions
  if (response.status === 403 && isStateChanging && !options._retriedCsrf) {
    const errorData = await response.clone().json().catch(() => ({}));
    const rawErrorText = typeof errorData === 'string' ? errorData : JSON.stringify(errorData).toLowerCase();
    const isCsrfFailure = rawErrorText.includes('csrf');

    if (isCsrfFailure) {
      try {
        await fetchCsrfToken();
        return request(path, { ...options, _retriedCsrf: true });
      } catch {
        // Fall through to regular error handling if re-fetch fails
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData, status: response.status } };
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
