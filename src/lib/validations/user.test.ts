import { describe, expect, it } from 'vitest';
import { accountFormSchema, updateMeSchema } from './user';

// First issue's message — our messages are i18n keys, so this asserts the exact key the UI shows
function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
    return result.error?.issues[0]?.message;
}

describe('updateMeSchema', () => {
    it('trims the name', () => {
        expect(updateMeSchema.parse({ name: '  สมชาย ใจดี  ' })).toEqual({ name: 'สมชาย ใจดี' });
    });

    it('accepts Thai names with tone marks and spaces', () => {
        expect(updateMeSchema.safeParse({ name: 'ณัฐสิทธิ์ สุขประเสริฐ' }).success).toBe(true);
    });

    it('rejects a whitespace-only name as required', () => {
        expect(firstError(updateMeSchema.safeParse({ name: '   ' }))).toBe('nameRequired');
    });

    it('rejects null instead of treating it as "not sent"', () => {
        expect(updateMeSchema.safeParse({ name: null }).success).toBe(false);
    });

    it('rejects an empty body', () => {
        expect(firstError(updateMeSchema.safeParse({}))).toBe('nothingToUpdate');
    });

    // Mass assignment: privileged or verified-only fields must never be accepted here
    it.each([
        [{ name: 'A', role: 'technician' }],
        [{ name: 'A', email: 'new@example.com' }],
        [{ passwordHash: 'x' }],
    ])('rejects unknown keys %j', (input) => {
        expect(updateMeSchema.safeParse(input).success).toBe(false);
    });
});

describe('accountFormSchema', () => {
    it('requires a name (unlike the PATCH schema)', () => {
        expect(firstError(accountFormSchema.safeParse({ name: '' }))).toBe('nameRequired');
    });
});
