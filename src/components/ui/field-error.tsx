'use client';

import { useTranslations } from 'next-intl';

// Renders a message key from the `validation` namespace. Unknown keys
// (e.g. zod built-ins like "Unrecognized key") fall back to a generic message
// so raw English never leaks into the UI.
export function FieldError({ message, id }: { message?: string; id?: string }) {
    const tv = useTranslations('validation');
    if (!message) return null;
    return (
        <p id={id} role="alert" className="text-sm text-destructive">
            {tv.has(message) ? tv(message) : tv('invalid')}
        </p>
    );
}