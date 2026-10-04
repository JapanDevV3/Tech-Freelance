import { NextResponse } from 'next/server';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import { isLocalStorage } from '@/lib/storage';
import { resolveLocalPath } from '@/lib/storage/local';
import { contentTypeFromKey, isOwnedKey, purposeOfKey } from '@/lib/uploads/keys';
import { UPLOAD_PURPOSES } from '@/lib/uploads/constants';
import { requireApiSession } from '@/lib/api/guard';
import { apiError } from '@/lib/api/errors';

export async function PUT(req: Request, ctx: RouteContext<'/api/v1/uploads/local/[...key]'>) {
    if (!isLocalStorage()) return apiError('NOT_FOUND', 404);

    const guard = await requireApiSession();
    if (!guard.ok) return guard.response;
    const { session } = guard;

    const key = (await ctx.params).key.join('/');
    const purpose = purposeOfKey(key);
    if (!purpose || !isOwnedKey(key, purpose, session.user.id)) {
        return apiError('FORBIDDEN', 403);
    }
    if (req.headers.get('content-type') !== contentTypeFromKey(key)) {
        return apiError('UNSUPPORTED_MEDIA_TYPE', 415);
    }
    if (!req.body) return apiError('EMPTY_BODY', 400);

    const max = UPLOAD_PURPOSES[purpose].maxBytes;
    const dest = resolveLocalPath(key);
    const tmp = `${dest}.${crypto.randomUUID()}.part`;
    await mkdir(path.dirname(dest), { recursive: true });

    // Count real bytes — Content-Length is client-controlled and can lie
    let bytes = 0;
    const limit = new Transform({
        transform(chunk: Buffer, _enc, cb) {
            bytes += chunk.length;
            cb(bytes > max ? new Error('TOO_LARGE') : null, chunk);
        },
    });

    try {
        await pipeline(Readable.fromWeb(req.body as NodeReadableStream), limit, createWriteStream(tmp, { flags: 'wx' }));
        await rename(tmp, dest); // atomic: nobody ever reads a half-written file
        return new NextResponse(null, { status: 200 });
    } catch (err) {
        await unlink(tmp).catch(() => undefined);
        
        if (err instanceof Error && err.message === 'TOO_LARGE') {
            return apiError('PAYLOAD_TOO_LARGE', 413);
        }
        console.error(err);
        return apiError('INTERNAL', 500);
    }
}