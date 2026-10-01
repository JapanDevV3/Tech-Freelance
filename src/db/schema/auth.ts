import { PgTable, uuid, text, timestamp, pgTable } from "drizzle-orm/pg-core";
import { userRole } from "./enums";

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: userRole('role').notNull().default('customer'),
    avatarKey: text('avatar_key'), // storage key, never a URL — see lib/storage
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})