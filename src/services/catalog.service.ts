import { db } from "@/db/client";
import { serviceImages, services, technicianProfiles } from "@/db/schema";
import { eq, and, or, ilike, lte, asc, desc, type SQL } from 'drizzle-orm';
import type { CreateServiceInput } from '@/lib/validations/service';
import { ServiceCategory } from "@/lib/service-categories";
import { isOwnedKey } from "@/lib/uploads/keys";
import { getStorage } from "@/lib/storage";
import { UPLOAD_PURPOSES } from "@/lib/uploads/constants";

export type ServiceSort = 'newest' | 'price_asc' | 'price_desc';
export type ServiceFilters = { q?: string; category?: ServiceCategory; maxPrice?: number; sort?: ServiceSort };

export async function createService(userId: string, input: CreateServiceInput) {
    const profile = await db.query.technicianProfiles.findFirst({ where: eq(technicianProfiles.userId, userId) });
    if (!profile) throw new Error('NO_PROFILE');

    // Verify keys OUTSIDE the transaction — never hold a DB connection during I/O
    const keys = [...new Set(input.imageKeys)];
    if (keys.some((k) => !isOwnedKey(k, 'serviceImage', userId))) throw new Error('INVALID_IMAGE');

    const storage = getStorage();
    const heads = await Promise.all(keys.map((k) => storage.head(k)));
    if (heads.some((h) => !h || h.size > UPLOAD_PURPOSES.serviceImage.maxBytes)) throw new Error('INVALID_IMAGE');

    return db.transaction(async (tx) => {
        const [created] = await tx.insert(services).values({
            technicianId: profile.id,
            title: input.title,
            description: input.description,
            category: input.category,
            mode: input.mode,
            duration: input.duration,
            serviceArea: input.mode === 'onsite' ? input.serviceArea : null, // don't store stale area
            basePriceAmount: Math.round(input.priceBaht * 100),
            status: input.status,
        }).returning();

        if (keys.length) {
            await tx.insert(serviceImages).values(keys.map((key, position) => ({
                serviceId: created.id, storageKey: key, position,
                contentType: heads[position]!.contentType, sizeBytes: heads[position]!.size,
            })));
        }
        return created;
    });
}

export async function listServicesByTechnician(technicianId: string) {
    return db.query.services.findMany({
        where: eq(services.technicianId, technicianId),
        orderBy: desc(services.createdAt),
    });
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

export async function getServiceById(id: string) {
    return db.query.services.findFirst({
        where: eq(services.id, id),
        with: {
            technician: { columns: { id: true, displayName: true, bio: true } }
        }
    });
}