// Pure → unit-testable. Order of `next` is the new display order (index 0 = cover).
export function diffImageKeys(current: string[], next: string[]) {
    const cur = new Set(current);
    const nxt = new Set(next);
    return {
        added: next.filter((key) => !cur.has(key)),
        removed: current.filter((key) => !nxt.has(key)),
    }
}