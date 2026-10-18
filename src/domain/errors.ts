// Domain speaks in codes, never HTTP statuses — the API layer decides the status.
export type DomainErrorCode = | 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATE' | 'QUOTE_STALE' | 'QUOTE_LIMIT_REACHED' | 'CONFLICT';

export class DomainError extends Error {
    constructor(readonly code: DomainErrorCode) {
        super(code);
        this.name = 'DomainError';
    }
}