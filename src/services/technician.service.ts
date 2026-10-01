import { db } from '@/db/client';
import { technicianProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { ProfileInput } from '@/lib/validations/technician';

export async function getMyProfile(userId: string) {
    return db.query.technicianProfiles.findFirst({
        where: eq(technicianProfiles.userId, userId),
    });
}

// Atomic upsert: a single INSERT ... ON CONFLICT (user_id) DO UPDATE.
// The previous select-then-insert raced when two saves arrived together
// (both saw "no profile", the second insert hit the unique constraint → 500).
export async function upsertMyProfile(userId: string, input: ProfileInput) {
    const values = {
        displayName: input.displayName,
        phone: input.phone || null,
        serviceArea: input.serviceArea || null,
        experienceYears: input.experienceYears,
        skills: input.skills,
        bio: input.bio || null,
    };

    const [profile] = await db
        .insert(technicianProfiles)
        .values({ userId, ...values })
        .onConflictDoUpdate({
            target: technicianProfiles.userId, // relies on UNIQUE(user_id)
            set: { ...values, updatedAt: new Date() },
        })
        .returning();

    return profile;
}
