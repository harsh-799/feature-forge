/**
 * Extracts and formats any redirect URL from the current window location search parameters.
 * Handles single parameter, nested query strings, and parameter separation cleanly.
 */
export function getRedirectUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  let redirectUrl = searchParams.get('redirect');
  if (!redirectUrl) return null;

  // Handle edge cases where token query parameter might be parsed separately
  const token = searchParams.get('token');
  if (token && !redirectUrl.includes('token=')) {
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl = `${redirectUrl}${separator}token=${encodeURIComponent(token)}`;
  }

  return redirectUrl;
}
