import { pgTable, uuid, text, integer, char, timestamp, index, smallint, uniqueIndex } from 'drizzle-orm/pg-core';
import { technicianProfiles } from './technician';
import { serviceMode, serviceStatus, serviceCategory, serviceDuration } from './enums';

export const services = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    technicianId: uuid('technician_id').notNull()
        .references(() => technicianProfiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    mode: serviceMode('mode').notNull().default('remote'),
    basePriceAmount: integer('base_price_amount').notNull(),  // สตางค์!
    currency: char('currency', { length: 3 }).notNull().default('THB'),
    category: serviceCategory('category').notNull().default('other'),
    duration: serviceDuration('duration').notNull().default('days_1_2'),
    serviceArea: text('service_area'),
    status: serviceStatus('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
    byTech: index('services_technician_idx').on(t.technicianId),
    activeIdx: index('services_status_created_idx').on(t.status, t.createdAt),
    categoryIndx: index('services_category_idx').on(t.category),
}));

export const serviceImages = pgTable('service_images', {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
    storageKey: text('storage_key').notNull().unique(),
    position: smallint('position').notNull(),       // 0 = cover
    contentType: text('content_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    uniqueIndex('service_images_service_position_uq').on(t.serviceId, t.position), // only one cover
]);