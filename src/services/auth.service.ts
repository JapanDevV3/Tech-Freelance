import { db } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { RegisterInput } from "../lib/validations/auth";

export async function registerUser(input: RegisterInput) {

    // Check email is exist?
    const existing = await db.query.users.findFirst({
        where: eq(users.email, input.email),
    });

    if (existing) throw new Error('EMAIL_TAKEN');

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

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
}