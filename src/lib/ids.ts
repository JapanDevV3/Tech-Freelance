const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres throws 22P02 on a malformed uuid, which would surface as a 500 — reject early
export const isUuid = (value: string) => UUID_RE.test(value);