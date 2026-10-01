import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { resolveLocalPath } from '@/lib/storage/local';
import { contentTypeFromKey, isValidKey } from '@/lib/uploads/keys';

export async function GET(_req: Request, ctx: RouteContext<'/api/v1/files/[...key]'>) {
    const key = (await ctx.params).key.join('/');
    if (!isValidKey(key)) return new Response(null, { status: 404 });
    try {
        const full = resolveLocalPath(key);
        const { size } = await stat(full);
        return new Response(Readable.toWeb(createReadStream(full)) as ReadableStream, {
            headers: {
                'Content-Type': contentTypeFromKey(key),
                'Content-Length': String(size),
                'Cache-Control': 'public, max-age=31536000, immutable', // UUID keys never change content
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch {
        return new Response(null, { status: 404 });
    }
}