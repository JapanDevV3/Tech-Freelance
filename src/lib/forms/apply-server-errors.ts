import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

type ApiIssue = { path?: (string | number)[]; message: string };
export type ApiErrorBody = { error?: { code?: string; details?: ApiIssue[] } } | null;

const ROOT_ERROR_KEYS: Record<string, string> = { RATE_LIMITED: 'tooManyRequests' };

/**
 * Maps our API's VALIDATION_ERROR details onto react-hook-form fields.
 * Server messages are the same i18n keys as the client zod schemas,
 * so they can be rendered by <FieldError> without translation glue.
 *
 * Returns false when the body is not a field-level validation error,
 * so the caller can fall back to a root error.
 */
export function applyServerErrors<T extends FieldValues>(
    body: ApiErrorBody,
    setError: UseFormSetError<T>,
    fields: readonly Path<T>[],
    fieldMap: Partial<Record<string, Path<T>>> = {},
): boolean {
    const details = body?.error?.code === 'VALIDATION_ERROR' ? body.error.details : undefined;
    if (!details?.length) return false;

    for (const issue of details) {
        const raw = String(issue.path?.[0] ?? '');
        const field = fieldMap[raw] ?? (raw as Path<T>);
        if (fields.includes(field)) setError(field, { message: issue.message });
        else setError('root', { message: 'saveFailed' });
    }
    return true;
}

// Known API error codes → specific root message; anything else → the form's fallback
export function rootErrorKey(body: ApiErrorBody, fallback: string) {
    return ROOT_ERROR_KEYS[body?.error?.code ?? ''] ?? fallback;
}