import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiErrorCode =
    | 'BAD_REQUEST'
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'CONFLICT'
    | 'EMAIL_TAKEN'
    | 'NO_PROFILE'
    | 'RATE_LIMITED'
    | 'INTERNAL'
    | 'PAYLOAD_TOO_LARGE'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'EMPTY_BODY';

export type ApiIssue = { path: PropertyKey[]; message: string };

// The single error envelope every route returns: { error: { code, details? } }.
// No human-readable message — the client translates `code` and details[].message (i18n keys).
export function apiError(
    code: ApiErrorCode,
    status: number,
    init: { details?: ApiIssue[]; headers?: HeadersInit } = {},
) {
    return NextResponse.json(
        { error: { code, ...(init.details && { details: init.details }) } },
        { status, headers: init.headers },
    );
}

// Expose only path + message: zod issues carry internals the client doesn't need
export function validationError(err: ZodError) {
    return apiError('VALIDATION_ERROR', 422, {
        details: err.issues.map(({ path, message }) => ({ path, message })),
    });
}