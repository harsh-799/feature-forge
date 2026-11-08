/**
 * Extracts and formats any redirect URL from the current window location search parameters.
 * Handles single parameter, nested query strings, token/acceptToken parameters, and separation cleanly.
 */
export function getRedirectUrl(customLocation) {
  const search = customLocation?.search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const searchParams = new URLSearchParams(search);
  let redirectUrl = searchParams.get('redirect');
  const token = searchParams.get('token') || searchParams.get('acceptToken');

  if (!redirectUrl) {
    if (token) {
      return `/accept-invite?token=${encodeURIComponent(token)}`;
    }
    return null;
  }

  // Handle double-encoded redirect URLs (e.g. %2Faccept-invite...)
  try {
    if (redirectUrl.startsWith('%2F') || redirectUrl.startsWith('%2f')) {
      redirectUrl = decodeURIComponent(redirectUrl);
    }
  } catch {
    // ignore decode error
  }

  // Handle edge cases where token/acceptToken query parameter might be parsed separately
  if (token && !redirectUrl.includes('token=') && !redirectUrl.includes('acceptToken=')) {
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl = `${redirectUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  return redirectUrl;
}
