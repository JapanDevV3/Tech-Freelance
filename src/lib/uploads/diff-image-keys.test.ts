import { describe, expect, it } from 'vitest';
import { diffImageKeys } from './diff-image-keys';

describe('diffImageKeys', () => {
    it('reorder only → nothing added or removed', () =>
        expect(diffImageKeys(['a', 'b'], ['b', 'a'])).toEqual({ added: [], removed: [] }));
    it('replacing the cover adds one and removes one', () =>
        expect(diffImageKeys(['a', 'b'], ['c', 'b'])).toEqual({ added: ['c'], removed: ['a'] }));
    it('clearing all images removes everything', () =>
        expect(diffImageKeys(['a', 'b'], [])).toEqual({ added: [], removed: ['a', 'b'] }));
    it('first upload adds everything in order', () =>
        expect(diffImageKeys([], ['x', 'y'])).toEqual({ added: ['x', 'y'], removed: [] }));
});