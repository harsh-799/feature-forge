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

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const request = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers = {
    ...getHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized response globally, excluding login and register endpoints to prevent loops on bad credentials
  if (response.status === 401 && !url.endsWith('/auth/login') && !url.endsWith('/auth/register')) {
    const requestToken = headers['Authorization']?.replace('Bearer ', '');
    const currentToken = localStorage.getItem('token');
    if (!requestToken || requestToken === currentToken) {
      notify401();
    }
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData, status: 401 } };
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
