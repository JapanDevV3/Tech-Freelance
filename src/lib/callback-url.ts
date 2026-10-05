import { routing } from "@/i18n/routing";

export const DEFAULT_CALLBACK_PATH = '/dashboard';

// A throwaway origin: if parsing lands anywhere else, the input pointed off-site.
const BASE = 'http://internal.invalid';
const MAX_LENGTH = 512;

/**
 * Turns an untrusted ?callbackUrl= value into a same-origin, locale-less path.
 * Never throws — anything suspicious falls back to DEFAULT_CALLBACK_PATH.
 */
export function toSafeCallbackPath(raw: string | null | undefined): string {
    if (!raw || raw.length > MAX_LENGTH || !raw.startsWith('/')) return DEFAULT_CALLBACK_PATH;

    let url: URL;
    try {
        // Same WHATWG parser the browser uses: '//x', '/\x' and '/<TAB>/x'
        // are all resolved to host "x" here, exactly as the browser would.
        url = new URL(raw, BASE);
    } catch {
        return DEFAULT_CALLBACK_PATH;
    }
    if (url.origin !== BASE) return DEFAULT_CALLBACK_PATH;

    const path = stripLocale(url.pathname);
    // Sending the user back to /auth/* after login would loop
    if (path === '/auth' || path.startsWith('/auth/')) return DEFAULT_CALLBACK_PATH;

    // Rebuild from the parsed URL — never redirect to the raw input
    const result = path + url.search + url.hash;

    // Check what we actually emit: '..' normalisation ('/..//x') and locale
    // stripping ('/th//x') can both turn a same-origin path into '//x'.
    if(result.startsWith('//')) return DEFAULT_CALLBACK_PATH;

    return result;
}

function stripLocale(pathname: string): string {
    const [, first, ...rest] = pathname.split('/');
    return (routing.locales as readonly string[]).includes(first)
        ? '/' + rest.join('/')
        : pathname;
}