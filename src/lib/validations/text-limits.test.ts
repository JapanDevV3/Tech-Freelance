import { describe, expect, it } from 'vitest';
import type { z } from 'zod';
import {
    CANCEL_REASON_MAX, PROBLEM_DESCRIPTION_MAX, QUOTE_NOTE_MAX,
    cancelOrderSchema, createOrderSchema, sendQuoteSchema,
} from './order';
import { BIO_MAX, profileSchema } from './technician';
import { NAME_MAX, nameField } from './user';

// The forms' <CharCount> turns red at `trimmed length > *_MAX`. These tests pin
// the schemas to the same rule, so the counter and validation can't drift apart.
const cases: [string, z.ZodType, number][] = [
    ['problemDescription', createOrderSchema.shape.problemDescription, PROBLEM_DESCRIPTION_MAX],
    ['quote note', sendQuoteSchema.shape.note, QUOTE_NOTE_MAX],
    ['cancel reason', cancelOrderSchema.shape.reason, CANCEL_REASON_MAX],
    ['bio', profileSchema.shape.bio, BIO_MAX],
    ['name', nameField, NAME_MAX],
];

describe.each(cases)('%s length limit', (_name, schema, max) => {
    it('accepts exactly max characters', () => expect(schema.safeParse('ก'.repeat(max)).success).toBe(true));
    it('rejects max + 1 characters', () => expect(schema.safeParse('ก'.repeat(max + 1)).success).toBe(false));
    // Why the counter uses trim(): surrounding whitespace never counts toward the limit
    it('ignores surrounding whitespace', () =>
        expect(schema.safeParse(`  ${'ก'.repeat(max)}  `).success).toBe(true));
});
