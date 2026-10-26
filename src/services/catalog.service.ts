import { db } from "@/db/client";
import { serviceImages, services, technicianProfiles } from "@/db/schema";
import { eq, and, or, ilike, lte, asc, desc, type SQL, isNull, inArray } from 'drizzle-orm';
import type { CreateServiceInput } from '@/lib/validations/service';
import { ServiceCategory } from "@/lib/service-categories";
import { isOwnedKey } from "@/lib/uploads/keys";
import { getStorage } from "@/lib/storage";
import { UPLOAD_PURPOSES } from "@/lib/uploads/constants";
import { cache } from "react";
import { profileIdOf } from "./technician.service";
import { isUniqueViolation } from "@/db/errors";
import { diffImageKeys } from "@/lib/uploads/diff-image-keys";

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

const ownedBy = (userId: string) => inArray(services.technicianId, profileIdOf(userId))

function toServiceColumns(input: CreateServiceInput) {
    return {
        title: input.title,
        description: input.description,
        category: input.category,
        mode: input.mode,
        duration: input.duration,
        serviceArea: input.mode === 'onsite' ? input.serviceArea : null,
        basePriceAmount: Math.round(input.priceBaht * 100),
        status: input.status,
    }
}

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
            ...toServiceColumns(input)
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

export const getServiceById = cache(async (id: string) => {
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
    const now = new Date();
    const [deleted] = await db
        .update(services)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(services.id, serviceId), ownedBy(userId), notDeleted))
        .returning({ id: services.id });

    if (!deleted) throw new ServiceNotFoundError();
    // Images + files are kept on purpose: future orders reference this service.
    // A purge job hard-deletes old soft-deleted rows and calls storage.remove().
}

// Edit page needs storage KEYs (to send back) + URLs (to preview); getServiceById only has URLs.
export async function getServiceForEdit(userId: string, serviceId: string) {
    const row = await db.query.services.findFirst({
        where: and(eq(services.id, serviceId), notDeleted, ownedBy(userId)),
        with: { images: { columns: { storageKey: true }, orderBy: (img, { asc }) => asc(img.position) } },
    });

    if (!row) return null;
    const storage = getStorage();
    return { ...row, images: row.images.map((i) => ({ key: i.storageKey, url: storage.publicUrl(i.storageKey) })) }
}

export async function updateService(userId: string, serviceId: string, input: CreateServiceInput) {
    const current = await db.query.services.findFirst({
        where: and(eq(services.id, serviceId), notDeleted, ownedBy(userId)),
        columns: { id: true },
        with: { images: { columns: { storageKey: true, contentType: true, sizeBytes: true } } },
    });

    if(!current) throw new ServiceNotFoundError();

    const keys = [...new Set(input.imageKeys)];
    const { added, removed } = diffImageKeys(current.images.map((i) => i.storageKey), keys);
    
    // Verify only NEW keys (existing ones were verified when first attached) — outside the tx
    if (added.some((k) => !isOwnedKey(k, 'serviceImage', userId))) throw new Error('INVALID_IMAGE');
    const storage = getStorage();
    const heads = new Map(await Promise.all(added.map(async (k) => [k, await storage.head(k)] as const)));
    if ([...heads.values()].some((h) => !h || h.size > UPLOAD_PURPOSES.serviceImage.maxBytes)) throw new Error('INVALID_IMAGE');

    const meta = new Map(current.images.map((i) => [i.storageKey, { contentType: i.contentType, size: i.sizeBytes }]));
    const imageRows = keys.map((key, position) => {
        const m = meta.get(key) ?? heads.get(key)!;
        return { serviceId, storageKey: key, position, contentType: m.contentType, sizeBytes: m.size };
    });

    let updated;
    try {
        updated = await db.transaction(async (tx) => {
            const [row] = await tx.update(services)
                .set({ ...toServiceColumns(input), updatedAt: new Date() })
                .where(and(eq(services.id, serviceId), notDeleted, ownedBy(userId)))
                .returning();
            if (!row) throw new ServiceNotFoundError(); // deleted between our read and this write

            // Replace the whole image set: updating positions in place would collide on
            // UNIQUE(service_id, position) mid-way (e.g. swapping cover 0 ↔ 1)
            await tx.delete(serviceImages).where(eq(serviceImages.serviceId, serviceId));
            if (imageRows.length) await tx.insert(serviceImages).values(imageRows);
            return row;
        });
    } catch (err) {
        // An "added" key already attached to ANOTHER service → UNIQUE(storage_key)
        if (isUniqueViolation(err)) throw new Error('INVALID_IMAGE');
        throw err;
    }

    // Delete files only AFTER commit: if the tx had failed, the rows would still point at them.
    // Failure here leaves an orphan file (harmless; the cleanup cron will catch it) — never a broken row.
    const results = await Promise.allSettled(removed.map((k) => storage.remove(k)));
    results.forEach((r, i) => r.status === 'rejected' && console.error('storage.remove failed', removed[i], r.reason));

    return updated;
}

// Service reads stay in this module (it owns the notDeleted filter)
export async function getOrderableService(serviceId: string) {
    return db.query.services.findFirst({
        where: and(eq(services.id, serviceId), eq(services.status, 'active'), notDeleted),
        columns: { id: true, technicianId: true },
        with: { technician: { columns: { userId: true } } },
    });
}