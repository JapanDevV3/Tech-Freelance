import { pgTable, uuid, text, integer, char, timestamp, index } from 'drizzle-orm/pg-core';
import { technicianProfiles } from './technician';
import { serviceMode, serviceStatus } from './enums';

export const services = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    technicianId: uuid('technician_id').notNull()
        .references(() => technicianProfiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    mode: serviceMode('mode').notNull().default('remote'),
    basePriceAmount: integer('base_price_amount').notNull(),  // สตางค์!
    currency: char('currency', { length: 3 }).notNull().default('THB'),
    status: serviceStatus('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    byTech: index('services_technician_idx').on(t.technicianId),
    activeIdx: index('services_status_created_idx').on(t.status, t.createdAt),
}));