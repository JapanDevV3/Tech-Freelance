import { db } from "@/db/client";
import { serviceImages, services, technicianProfiles } from "@/db/schema";
import { eq, and, or, ilike, lte, asc, desc, type SQL, isNull, inArray } from 'drizzle-orm';
import type { CreateServiceInput } from '@/lib/validations/service';
import { ServiceCategory } from "@/lib/service-categories";
import { isOwnedKey } from "@/lib/uploads/keys";
import { getStorage } from "@/lib/storage";
import { UPLOAD_PURPOSES } from "@/lib/uploads/constants";
import { cache } from "react";

type ImageRow = { storageKey: string };

export type ServiceSort = 'newest' | 'price_asc' | 'price_desc';
export type ServiceFilters = { q?: string; category?: ServiceCategory; maxPrice?: number; sort?: ServiceSort };

/* Helper */
// Single place that turns storage keys into URLs for the active driver
function toImageUrls(images: ImageRow[]) {
    const storage = getStorage();
    return images.map((img) => storage.publicUrl(img.storageKey));
}

function withCoverUrl<T extends { images: ImageRow[] }>({ images, ...rest }: T) {
    return { ...rest, coverUrl: toImageUrls(images)[0] ?? null }
}

// Every read of `services` must exclude soft-deleted rows — keep the filter in ONE place
const notDeleted = isNull(services.deletedAt);

export class ServiceNotFoundError extends Error {
    constructor() {
        super('SERVICE_NOT_FOUND');
        this.name = 'ServiceNotFoundError';
    }
}

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
    const rows = await db.query.services.findMany({
        where: and(eq(services.technicianId, technicianId), notDeleted),
        orderBy: desc(services.createdAt),
        with: {
            images: { columns: { storageKey: true }, orderBy: (img, { asc }) => [asc(img.position)], limit: 1 }
        }
    });

    return rows.map(withCoverUrl)
}

export async function listActiveServices(filters: ServiceFilters = {}) {
    const where: SQL[] = [eq(services.status, 'active'), notDeleted];

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

    if (filters.category) {
        where.push(eq(services.category, filters.category));
    }

    const orderBy =
        filters.sort === 'price_asc' ? asc(services.basePriceAmount)
            : filters.sort === 'price_desc' ? desc(services.basePriceAmount)
                : desc(services.createdAt);

    const rows = await db.query.services.findMany({
        where: and(...where),
        orderBy,
        limit: 50,
        with: {
            technician: { columns: { displayName: true } },
            images: { columns: { storageKey: true }, orderBy: (img, { asc }) => [asc(img.position)], limit: 1 },
        }
    })

    return rows.map(withCoverUrl)
}

export const getServiceById = cache (async (id: string) => {
    const row = await db.query.services.findFirst({
        where: and(eq(services.id, id), notDeleted),
        with: {
            technician: { columns: { id: true, userId: true, displayName: true, bio: true } },
            images: { columns: { storageKey: true }, orderBy: (img, { asc }) => [asc(img.position)] },
        }
    });

    if (!row) return null;
    const { images, ...service } = row;

    return { ...service, imageUrls: toImageUrls(images) };
})

// Ownership lives in the service layer (design §9, layer 2).
// The check and the write are ONE statement: no window between "is it yours?" and "update it".
// "Doesn't exist", "not yours" and "already deleted" all match 0 rows → NotFound.
export async function softDeleteService(userId: string, serviceId: string) {
    const myProfileId = db
        .select({ id: technicianProfiles.id })
        .from(technicianProfiles)
        .where(eq(technicianProfiles.userId, userId));

    const now = new Date();
    const [deleted] = await db
        .update(services)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(services.id, serviceId), inArray(services.technicianId, myProfileId), notDeleted))
        .returning({ id: services.id });

    if (!deleted) throw new ServiceNotFoundError();
    // Images + files are kept on purpose: future orders reference this service.
    // A purge job hard-deletes old soft-deleted rows and calls storage.remove().
}