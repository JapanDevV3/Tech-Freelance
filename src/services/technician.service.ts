import { db } from '@/db/client';
import { technicianProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { ProfileInput } from '@/lib/validations/technician';

export async function getMyProfile(userId: string) {
    return db.query.technicianProfiles.findFirst({
        where: eq(technicianProfiles.userId, userId),
    });
}

export async function upsertMyProfile(userId: string, input: ProfileInput) {
    const existing = await getMyProfile(userId);

    if (existing) {
        const [updated] = await db.update(technicianProfiles).set({
            displayName: input.displayName,
            bio: input.bio || null,
            skills: input.skills ?? [],
            updatedAt: new Date(),
        })
        .where(eq(technicianProfiles.userId, userId))
        .returning();

        return updated;
    }

    const [created] = await db
        .insert(technicianProfiles)
        .values({
            userId,
            displayName: input.displayName,
            bio: input.bio || null,
            skills: input.skills ?? [],
        })
        .returning();

        return created;
}