import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getStorage } from '@/lib/storage';
import { isOwnedKey } from '@/lib/uploads/keys';
import { UPLOAD_PURPOSES } from '@/lib/uploads/constants';
import type { UpdateMeInput } from '@/lib/validations/user';

export async function getMyAvatarKey(userId: string) {
    const row = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { avatarKey: true },
    });
    return row?.avatarKey ?? null;
}

export async function setMyAvatar(userId: string, key: string) {
    // 1) The key must live under this user's avatar prefix
    if (!isOwnedKey(key, 'avatar', userId)) throw new Error('INVALID_IMAGE');

    // 2) The object must really exist and respect the size limit (storage is the source of truth)
    const storage = getStorage();
    const head = await storage.head(key);
    if (!head || head.size > UPLOAD_PURPOSES.avatar.maxBytes) throw new Error('INVALID_IMAGE');

    const oldKey = await getMyAvatarKey(userId);
    await db.update(users).set({ avatarKey: key, updatedAt: new Date() }).where(eq(users.id, userId));

    // 3) Delete the old file only AFTER the DB points at the new one:
    //    if this fails we leak a file — far better than a broken avatar.
    if (oldKey && oldKey !== key) await storage.remove(oldKey);
}

// The signed-in user's own profile, read from the DB rather than the JWT: the session
// keeps the name it had at sign-in. cache() makes it one query per request, however
// many server components (layout + page) ask for it.
export const getMe = cache(async (userId: string) => {
    const row = await db.query.users.findFirst({
        where: eq(users.id, userId),
        // Explicit columns: never load passwordHash into objects that may reach a client component
        columns: { name: true, email: true, avatarKey: true, createdAt: true },
    });
    return row ?? null;
});

// PATCH semantics: list every writable field explicitly — never spread `input` into set().
// updateMeSchema (.strict) is the first guard against mass assignment; this is the second.
// Drizzle skips keys whose value is undefined, so fields the client didn't send stay untouched.
export async function updateMe(userId: string, input: UpdateMeInput) {
    const [row] = await db
        .update(users)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(users.id, userId))
        // Explicit columns again: a bare returning() would hand back passwordHash too
        .returning({ name: users.name, email: users.email });

    // No row: the session points at a user that no longer exists
    return row ?? null;
}
