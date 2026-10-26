import { z } from 'zod';
import { SERVICE_DURATIONS } from '@/lib/service-categories';

export const createOrderSchema = z.object({
    serviceId: z.uuid(),
    problemDescription: z.string().trim().min(10, 'problemMin').max(2000, 'problemMax'),
}).strict();

export const sendQuoteSchema = z.object({
    amountBaht: z.number({ error: 'priceInvalid' }).positive('pricePositive').max(1_000_000, 'priceMax'),
    duration: z.enum(SERVICE_DURATIONS).optional(),
    // Rework rounds AFTER delivery — not the same thing as quote revisions
    revisionsIncluded: z.number().int().min(0).max(20, 'revisionsMax').optional(),
    note: z.string().trim().max(2000, 'quoteNoteMax').optional(),
    // Server sets expiresAt from this — never trust a client clock or timezone
    validDays: z.number().int().min(1).max(30, 'validDaysMax').optional(),
}).strict();

export const acceptQuoteSchema = z.object({ quoteId: z.uuid() }).strict();
export const cancelOrderSchema = z.object({ reason: z.string().trim().max(500).optional() }).strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type SendQuoteInput = z.infer<typeof sendQuoteSchema>;