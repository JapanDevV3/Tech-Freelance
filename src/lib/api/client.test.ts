import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiPatch, apiPost } from './client';

// Replace the global fetch with one canned response; return the mock for call assertions
function mockFetch(response: Response) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function jsonResponse(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// Restore the real fetch so a stub never leaks into another test
afterEach(() => {
    vi.unstubAllGlobals();
});

describe('request shape', () => {
    it('apiPatch sends PATCH with a JSON body', async () => {
        const fetchMock = mockFetch(jsonResponse({ data: { name: 'A' } }));

        await apiPatch('/api/v1/me', { name: 'A' });

        expect(fetchMock).toHaveBeenCalledWith('/api/v1/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'A' }),
        });
    });

    it('apiPost without a body sends neither a body nor a Content-Type', async () => {
        const fetchMock = mockFetch(new Response(null, { status: 204 }));

        await apiPost('/api/v1/orders/1/cancel');

        const [, init] = fetchMock.mock.calls[0];
        expect(init.method).toBe('POST');
        expect(init.headers).toBeUndefined();
        expect(init.body).toBeUndefined();
    });
});

describe('response handling', () => {
    it('returns undefined data on 204 without reading the body', async () => {
        const res = new Response(null, { status: 204 });
        const jsonSpy = vi.spyOn(res, 'json');
        mockFetch(res);

        expect(await apiPost('/x')).toEqual({ ok: true, data: undefined });
        expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('unwraps the data envelope on success', async () => {
        mockFetch(jsonResponse({ data: { id: 'o1' } }));

        expect(await apiPost<{ id: string }>('/x', {})).toEqual({ ok: true, data: { id: 'o1' } });
    });

    it('returns the error code and the full body on an API error', async () => {
        const body = { error: { code: 'VALIDATION_ERROR', details: [{ path: ['name'], message: 'nameRequired' }] } };
        mockFetch(jsonResponse(body, 422));

        expect(await apiPatch('/x', {})).toEqual({ ok: false, status: 422, code: 'VALIDATION_ERROR', body });
    });

    it('falls back to INTERNAL when the error body is not JSON', async () => {
        mockFetch(new Response('<html>Bad Gateway</html>', { status: 502 }));

        expect(await apiPost('/x')).toEqual({ ok: false, status: 502, code: 'INTERNAL', body: null });
    });

    it('returns NETWORK with status 0 when fetch rejects', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

        expect(await apiPost('/x', {})).toEqual({ ok: false, status: 0, code: 'NETWORK', body: null });
    });
});
