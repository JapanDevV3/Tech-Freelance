// Postgres unique_violation = SQLSTATE 23505.
// drizzle-orm 0.45 wraps the driver error in DrizzleQueryError and keeps the
// original pg error on `.cause`; check both to be version-proof.
export function isUniqueViolation(err: unknown): boolean {
    const code =
        (err as { code?: string })?.code ??
        (err as { cause?: { code?: string } })?.cause?.code;
    return code === '23505';
}