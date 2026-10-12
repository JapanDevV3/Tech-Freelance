import { pgEnum } from "drizzle-orm/pg-core";
import { SERVICE_CATEGORIES, SERVICE_DURATIONS } from "@/lib/service-categories";

export const userRole = pgEnum('user_role', ['customer', 'technician']);
export const serviceMode = pgEnum('service_mode', ['remote', 'onsite']);
export const serviceStatus = pgEnum('service_status', ['draft', 'active', 'paused', 'archived']);
export const serviceCategory = pgEnum('service_category', SERVICE_CATEGORIES);
export const serviceDuration = pgEnum('service_duration', SERVICE_DURATIONS);
export const orderStatus = pgEnum('order_status', [
    'pending_quote', 'quoted', 'accepted', 'paid', 'in_progress', 'completed', 'released', 'cancelled', 'refunded', 'disputed',
]);
export const quoteStatus = pgEnum('quote_status', ['sent', 'superseded', 'accepted', 'rejected', 'expired']);