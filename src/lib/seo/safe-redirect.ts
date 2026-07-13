/**
 * Allow only same-origin relative paths for post-login redirects.
 * Rejects absolute URLs, protocol-relative URLs, and non-path values.
 */
export function sanitizeRedirectPath(value: string | undefined | null): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Absolute URLs or protocol-relative
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || trimmed.startsWith('//')) {
    return undefined;
  }

  if (!trimmed.startsWith('/')) return undefined;

  try {
    const url = new URL(trimmed, 'https://coldop.in');
    if (url.origin !== 'https://coldop.in') return undefined;
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return undefined;
  }
}
