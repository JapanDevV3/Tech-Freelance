import { relations } from 'drizzle-orm';
import { technicianProfiles } from './technician';
import { services } from './catalog';

export const technicianProfilesRelations = relations(technicianProfiles, ({ many }) => ({
    services: many(services),
}));

export const servicesRelations = relations(services, ({ one }) => ({
    technician: one(technicianProfiles, {
        fields: [services.technicianId],
        references: [technicianProfiles.id],
    }),
}));