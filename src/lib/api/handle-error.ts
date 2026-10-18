import { DomainError, type DomainErrorCode } from "@/domain/errors";
import { apiError, validationError } from "./errors";
import { ZodError } from "zod";
import { isUniqueViolation } from "@/db/errors";

const DOMAIN_STATUS: Record<DomainErrorCode, number> = {
    NOT_FOUND: 404, FORBIDDEN: 403, INVALID_STATE: 409, QUOTE_STALE: 409, QUOTE_LIMIT_REACHED: 409, CONFLICT: 409,
}

export function handleRouteError(err: unknown) {
    if (err instanceof SyntaxError) return apiError('BAD_REQUEST', 400);
    if (err instanceof ZodError) return validationError(err);
    if (err instanceof DomainError) return apiError(err.code, DOMAIN_STATUS[err.code]);
    if (isUniqueViolation(err)) return apiError('CONFLICT', 409); // safety net for races a lock missed
    console.error(err);
    return apiError('INTERNAL', 500);
}