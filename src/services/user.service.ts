import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { getStorage } from '@/lib/storage';
import { isOwnedKey } from '@/lib/uploads/keys';
import { UPLOAD_PURPOSES } from '@/lib/uploads/constants';

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
