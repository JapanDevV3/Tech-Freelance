import { relations } from 'drizzle-orm';
import { technicianProfiles } from './technician';
import { serviceImages, services } from './catalog';
import { users } from './auth';
import { orders, quotes, orderStatusEvents } from './orders';

export const technicianProfilesRelations = relations(technicianProfiles, ({ many }) => ({
    services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
    technician: one(technicianProfiles, { fields: [services.technicianId], references: [technicianProfiles.id] }),
    images: many(serviceImages),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
    service: one(services, { fields: [serviceImages.serviceId], references: [services.id] }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
    customer: one(users, { fields: [orders.customerId], references: [users.id] }),
    technician: one(technicianProfiles, { fields: [orders.technicianId], references: [technicianProfiles.id] }),
    service: one(services, { fields: [orders.serviceId], references: [services.id] }),
    quotes: many(quotes, { relationName: 'orderQuotes'}),
    acceptedQuote: one(quotes, { fields: [orders.acceptedQuoteId], references: [quotes.id], relationName: 'acceptedQuote' }),
    events: many(orderStatusEvents),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
    order: one(orders, { fields: [quotes.orderId], references: [orders.id], relationName: 'orderQuotes' }),
}));

export const orderStatusEventsRelations = relations(orderStatusEvents, ({ one }) => ({
    order: one(orders, { fields: [orderStatusEvents.orderId], references: [orders.id] }),
}));