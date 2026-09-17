import { db } from "@/db/client";
import { services, technicianProfiles } from "@/db/schema";
import { eq, and, or, ilike, lte, asc, desc, type SQL } from 'drizzle-orm';
import type { CreateServiceInput } from '@/lib/validations/service';
import { ServiceCategory } from "@/lib/service-categories";

export type ServiceSort = 'newest' | 'price_asc' | 'price_desc';
export type ServiceFilters = { q?: string; category?: ServiceCategory; maxPrice?: number; sort?: ServiceSort };

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
        category: input.category,
        basePriceAmount: Math.round(input.priceBaht * 100),
        status: 'active',
    })
        .returning();

    return created;
}

export async function listActiveServices(filters: ServiceFilters = {}) {

    const where: SQL[] = [eq(services.status, 'active')];

    if (filters.q) {
        where.push(
            or(
                ilike(services.title, `%${filters.q}%`),
                ilike(services.description, `%${filters.q}%`),
            )!,
        );
    }

    if (filters.maxPrice) {
        where.push(lte(services.basePriceAmount, filters.maxPrice * 100)); // baht → satang
    }

    if(filters.category){
        where.push(eq(services.category, filters.category));
    }

    const orderBy = 
        filters.sort === 'price_asc' ? asc(services.basePriceAmount)
        : filters.sort === 'price_desc' ? desc(services.basePriceAmount)
        : desc(services.createdAt);

    return db.query.services.findMany({
        where: and(...where),
        orderBy,
        limit: 50,
        with: {
            technician: { columns: { displayName: true } }
        }
    })
}