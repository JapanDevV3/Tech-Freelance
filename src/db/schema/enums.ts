import { pgEnum } from "drizzle-orm/pg-core";
import { SERVICE_CATEGORIES } from "@/lib/service-categories";

export const userRole = pgEnum('user_role', ['customer', 'technician']);
export const serviceMode = pgEnum('service_mode', ['remote', 'onsite']);
export const serviceStatus = pgEnum('service_status', ['draft', 'active', 'paused', 'archived']);
export const serviceCategory = pgEnum('service_category', SERVICE_CATEGORIES);