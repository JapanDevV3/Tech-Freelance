import { sql } from 'drizzle-orm';
import { type AnyPgColumn, uuid, check, index, pgTable, text, timestamp, integer, char, smallint, uniqueIndex } from "drizzle-orm/pg-core";
import { orderStatus, quoteStatus, serviceDuration } from './enums';
import { users } from './auth';
import { technicianProfiles } from './technician';
import { services } from './catalog';

export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => users.id),
    technicianId: uuid('technician_id').notNull().references(() => technicianProfiles.id),
    serviceId: uuid('service_id').notNull().references(() => services.id),
    status: orderStatus('status').notNull().default('pending_quote'),
    // orders ↔ quotes reference each other; AnyPgColumn breaks the TypeScript cycle
    acceptedQuoteId: uuid('accepted_quote_id').references((): AnyPgColumn => quotes.id),
    problemDescription: text('problem_description').notNull(),
    locationText: text('location_text'), // on-site later
    completedAt: timestamp('completed_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    // Hot query: "my orders, newest first"
    index('orders_customer_created_idx').on(t.customerId, t.createdAt),
    index('orders_technician_created_idx').on(t.technicianId, t.createdAt),
    // Invariant in the DB: past "quoted", an order must point at the quote it agreed on
    check('orders_accepted_has_quote',
        sql`${t.status} in ('pending_quote', 'quoted', 'cancelled') or ${t.acceptedQuoteId} is not null`),
]);

export const quotes = pgTable('quotes', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id),
    version: integer('version').notNull(),
    amount: integer('amount').notNull(), // satang
    currency: char('currency', { length: 3 }).notNull().default('THB'),
    duration: serviceDuration('duration'),
    revisionsIncluded: smallint('revisions_included'),
    note: text('note'),
    status: quoteStatus('status').notNull().default('sent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex('quotes_order_version_uidx').on(t.orderId, t.version),
    // At most ONE live quote per order — enforced by Postgres, not just app code
    uniqueIndex('quotes_one_sent_per_order_uidx').on(t.orderId).where(sql`${t.status} = 'sent'`),
    check('quotes_amount_positive', sql`${t.amount} > 0`),
]);

// Append-only audit trail → order timeline
export const orderStatusEvents = pgTable('order_status_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => orders.id),
    fromStatus: orderStatus('from_status'),
    toStatus: orderStatus('to_status').notNull(),
    actorUserId: uuid('actor_user_id').references(() => users.id), // null = system (webhook, cron)
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('order_status_events_order_idx').on(t.orderId, t.createdAt)]);