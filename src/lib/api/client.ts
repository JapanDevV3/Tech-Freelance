import type { ApiErrorBody } from "@/lib/forms/apply-server-errors";

export type ApiResult<T> = | { ok: true, data: T } | { ok: false, status: number; code: string; body: ApiErrorBody };

// Only the methods a client component actually sends. Add PUT/DELETE when a caller needs them.
type MutationMethod = 'POST' | 'PATCH';

// One place for fetch + JSON + our error envelope + network failure.
// Never throws: callers branch on `ok`, so no button can get stuck in "pending".
async function apiRequest<T>(method: MutationMethod, url: string, body?: unknown): Promise<ApiResult<T>> {
    let res: Response;
    try {
        res = await fetch(url, {
            method,
            // No body → no Content-Type: the cancel route treats an empty body as "no reason given"
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        // fetch only rejects when the request never got a response (offline, DNS, CORS)
        return { ok: false, status: 0, code: 'NETWORK', body: null };
    }

    // 204 has no body — calling res.json() on it would throw
    if (res.status === 204) return { ok: true, data: undefined as T };

    // A proxy error page or an empty 500 isn't JSON — don't let that crash the caller
    const json = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: json?.data as T };
    return { ok: false, status: res.status, code: json?.error?.code ?? 'INTERNAL', body: json };
}

// `body` is optional: the cancel route treats a missing body as "no reason given"
export function apiPost<T = unknown>(url: string, body?: unknown): Promise<ApiResult<T>> {
    return apiRequest<T>('POST', url, body);
}

// `body` must be an object: a PATCH with nothing to change is a caller bug
export function apiPatch<T = unknown>(url: string, body: object): Promise<ApiResult<T>> {
    return apiRequest<T>('PATCH', url, body);
}
