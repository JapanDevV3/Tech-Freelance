import { db } from "@/db/client";
import { services, technicianProfiles } from "@/db/schema";
import { eq } from 'drizzle-orm';
import type { CreateServiceInput } from '@/lib/validations/service';

export async function createService(userId: string, input: CreateServiceInput) {
    // Check Profile first
    const profile = await db.query.technicianProfiles.findFirst({
        where: eq(technicianProfiles.userId, userId),
    });

    if (!profile) throw new Error('NO_PROFILE');

    const [created] = await db.insert(services).values({
        technicianId: profile.id,
        title: input.title,
        description: input.description,
        mode: input.mode,
        basePriceAmount: Math.round(input.priceBaht * 100),
        status: 'active',
    })
        .returning();

    return created;
}