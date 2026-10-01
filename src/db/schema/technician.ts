import { pgTable, uuid, text, timestamp, smallint } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const technicianProfiles = pgTable('technician_profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    bio: text('bio'),
    skills: text('skills').array(),
    phone: text('phone'),                          // digits only, e.g. "0897654321" — never select on public pages
    serviceArea: text('service_area'),
    experienceYears: smallint('experience_years'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});