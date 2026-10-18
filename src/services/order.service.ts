import { db } from '@/db/client';
import { orders, quotes, orderStatusEvents, technicianProfiles } from '@/db/schema';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { DomainError } from '@/domain/errors';
import { assertCanPerform, type OrderParty, type OrderStatus } from '@/domain/order/state-machine';
import { isQuoteExpired, nextQuoteVersion } from '@/domain/order/quote-policy';
import { getOrderableService } from '@/services/catalog.service';
import { profileIdOf } from '@/services/technician.service';
import type { CreateOrderInput, SendQuoteInput } from '@/lib/validations/order';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
const DAY_MS = 24 * 60 * 60 * 1000;

function partyOf(o: { customerId: string; technicianUserId: string }, userId: string): OrderParty | null {
    if (o.customerId === userId) return 'customer';
    if (o.technicianUserId === userId) return 'technician';
    return null;
}

// Row lock until the transaction ends: concurrent actions on the SAME order queue here,
// and each one re-reads the status the previous one committed.
async function lockOrderForUser(tx: Tx, orderId: string, userId: string) {
    const [row] = await tx
        .select({ id: orders.id, status: orders.status, customerId: orders.customerId, technicianUserId: technicianProfiles.userId })
        .from(orders)
        .innerJoin(technicianProfiles, eq(technicianProfiles.id, orders.technicianId))
        .where(eq(orders.id, orderId))
        .for('update', { of: orders }); // lock the order row only
    const party = row ? partyOf(row, userId) : null;
    if (!row || !party) throw new DomainError('NOT_FOUND'); // non-participants can't learn it exists
    return { order: row, party };
}

// The ONLY way an order changes status: update + audit event, in the caller's transaction
async function recordTransition(
    tx: Tx, order: { id: string; status: OrderStatus }, to: OrderStatus, actorUserId: string | null,
    patch: Partial<typeof orders.$inferInsert> = {}, reason?: string,
) {
    await tx.update(orders).set({ ...patch, status: to, updatedAt: new Date() }).where(eq(orders.id, order.id));
    await tx.insert(orderStatusEvents).values({ orderId: order.id, fromStatus: order.status, toStatus: to, actorUserId, reason });
}

export async function createOrder(customerId: string, input: CreateOrderInput) {
    const service = await getOrderableService(input.serviceId);
    if (!service) throw new DomainError('NOT_FOUND');
    if (service.technician.userId === customerId) throw new DomainError('FORBIDDEN'); // can't hire yourself

    return db.transaction(async (tx) => {
        const [order] = await tx.insert(orders).values({
            customerId,
            technicianId: service.technicianId, // from the service row — never from the client
            serviceId: service.id,
            problemDescription: input.problemDescription,
        }).returning();
        await tx.insert(orderStatusEvents).values({ orderId: order.id, fromStatus: null, toStatus: 'pending_quote', actorUserId: customerId });
        return order;
    });
}

export async function sendQuote(userId: string, orderId: string, input: SendQuoteInput) {
    return db.transaction(async (tx) => {
        const { order, party } = await lockOrderForUser(tx, orderId, userId);
        const to = assertCanPerform('sendQuote', party, order.status);

        // Safe to count under the lock: no one else can add a version to this order right now
        const [{ maxVersion }] = await tx
            .select({ maxVersion: sql`coalesce(max(${quotes.version}), 0)`.mapWith(Number) })
            .from(quotes).where(eq(quotes.orderId, orderId));
        const version = nextQuoteVersion(maxVersion); // throws QUOTE_LIMIT_REACHED past the policy

        // Retire the live quote first — the partial unique index allows only one 'sent'
        await tx.update(quotes).set({ status: 'superseded' })
            .where(and(eq(quotes.orderId, orderId), eq(quotes.status, 'sent')));

        const [quote] = await tx.insert(quotes).values({
            orderId, version,
            amount: Math.round(input.amountBaht * 100),
            duration: input.duration ?? null,
            revisionsIncluded: input.revisionsIncluded ?? null,
            note: input.note || null,
            expiresAt: input.validDays ? new Date(Date.now() + input.validDays * DAY_MS) : null,
        }).returning();

        await recordTransition(tx, order, to, userId, {}, `quote_v${version}`);
        return quote;
    });
}

export async function acceptQuote(userId: string, orderId: string, quoteId: string) {
    return db.transaction(async (tx) => {
        const { order, party } = await lockOrderForUser(tx, orderId, userId);
        const to = assertCanPerform('accept', party, order.status);

        const quote = await tx.query.quotes.findFirst({ where: and(eq(quotes.id, quoteId), eq(quotes.orderId, orderId)) });
        if (!quote) throw new DomainError('NOT_FOUND');
        // Accept exactly what the customer saw: a revised or expired quote is stale.
        // Expiry is computed, not written — a write before a throw would be rolled back anyway.
        if (quote.status !== 'sent' || isQuoteExpired(quote.expiresAt, new Date())) throw new DomainError('QUOTE_STALE');

        await tx.update(quotes).set({ status: 'accepted' }).where(eq(quotes.id, quote.id));
        await recordTransition(tx, order, to, userId, { acceptedQuoteId: quote.id });
        return { orderId, quoteId: quote.id, amount: quote.amount };
    });
}

export async function cancelOrder(userId: string, orderId: string, reason?: string) {
    await db.transaction(async (tx) => {
        const { order, party } = await lockOrderForUser(tx, orderId, userId);
        const to = assertCanPerform('cancel', party, order.status);
        await tx.update(quotes).set({ status: 'rejected' })
            .where(and(eq(quotes.orderId, orderId), eq(quotes.status, 'sent')));
        await recordTransition(tx, order, to, userId, {}, reason);
    });
}

export async function getOrderForUser(userId: string, orderId: string) {
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
            // NO deletedAt filter: an order is a historical record of a service that may be gone now
            service: { columns: { id: true, title: true } },
            technician: { columns: { userId: true, displayName: true } },
            customer: { columns: { id: true, name: true } }, // whitelist — never pull password_hash
            quotes: { orderBy: [desc(quotes.version)] },
            events: { orderBy: [asc(orderStatusEvents.createdAt)] },
        },
    });
    if (!order) return null;
    const viewerParty = partyOf({ customerId: order.customerId, technicianUserId: order.technician.userId }, userId);
    return viewerParty ? { ...order, viewerParty } : null;
}

export async function listMyOrders(userId: string, party: OrderParty) {
    return db.query.orders.findMany({
        where: party === 'customer' ? eq(orders.customerId, userId) : inArray(orders.technicianId, profileIdOf(userId)),
        orderBy: [desc(orders.createdAt)],
        limit: 50, // keyset pagination later
        with: {
            service: { columns: { id: true, title: true } },
            technician: { columns: { displayName: true } },
            customer: { columns: { name: true } },
            quotes: { orderBy: [desc(quotes.version)], limit: 1, columns: { amount: true, version: true, status: true } },
        },
    });
}