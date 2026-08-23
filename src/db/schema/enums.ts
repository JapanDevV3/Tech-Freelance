import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum('user_role', ['customer', 'technician']);
export const serviceMode = pgEnum('service_mode', ['remote', 'onsite']);
export const serviceStatus = pgEnum('service_status', ['draft', 'active', 'paused', 'archived']);