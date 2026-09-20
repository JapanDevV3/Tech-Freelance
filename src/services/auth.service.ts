import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { RegisterInput } from "../lib/validations/auth";

// Precomputed bcrypt hash (cost 12) of a fixed non-password string.
// Comparing against this when the email is unknown keeps login response time
// constant, which prevents user enumeration via timing.
const DUMMY_HASH = '$2b$12$gfGuVD8eKxDgCPXek4M9CevsBnnyXE0SSQnSQl8/GJn0xVDjP9nC.';
const BCRYPT_COST = 12;

// Domain error → the controller maps this to HTTP 409
export class EmailTakenError extends Error {
    constructor() {
        super('EMAIL_TAKEN');
        this.name = 'EmailTakenError';
    }
}

// Postgres unique_violation = SQLSTATE 23505.
// drizzle-orm 0.45 wraps the driver error in DrizzleQueryError and keeps the
// original pg error on `.cause`; check both to be version-proof.
function isUniqueViolation(err: unknown): boolean {
    const code =
        (err as { code?: string })?.code ??
        (err as { cause?: { code?: string } })?.cause?.code;
    return code === '23505';
}

export async function registerUser(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    try {
        const [user] = await db.insert(users).values({
            email: input.email,
            passwordHash,
            name: input.name,
            role: input.role,
        }).returning({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
        });
        return user;
    } catch (err) {
        // The users_email_unique index is the source of truth for "email taken"
        if (isUniqueViolation(err)) throw new EmailTakenError();
        throw err; // unknown error → let the controller return 500
    }
}

export async function verifyCredentials(email: string, password: string) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    // Always run a compare (real hash or dummy) so timing doesn't reveal account existence
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hash);

    if (!user || !passwordOk) return null;

    // This shape becomes the `user` arg in the jwt() callback
    return { id: user.id, email: user.email, name: user.name, role: user.role };
}
