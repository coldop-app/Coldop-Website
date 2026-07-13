import { describe, expect, it } from 'vitest';
import { sanitizeRedirectPath } from './safe-redirect';

describe('sanitizeRedirectPath', () => {
  it('allows relative app paths', () => {
    expect(sanitizeRedirectPath('/daybook')).toBe('/daybook');
    expect(sanitizeRedirectPath('/people/abc?tab=1')).toBe('/people/abc?tab=1');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(sanitizeRedirectPath('https://evil.example/phish')).toBeUndefined();
    expect(sanitizeRedirectPath('//evil.example')).toBeUndefined();
    expect(sanitizeRedirectPath('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects non-path values', () => {
    expect(sanitizeRedirectPath('')).toBeUndefined();
    expect(sanitizeRedirectPath('daybook')).toBeUndefined();
    expect(sanitizeRedirectPath(undefined)).toBeUndefined();
  });
});
