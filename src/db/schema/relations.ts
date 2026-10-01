import { relations } from 'drizzle-orm';
import { technicianProfiles } from './technician';
import { serviceImages, services } from './catalog';

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