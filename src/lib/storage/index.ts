import type { StorageDriver } from './types';
import { localDriver } from './local';

export const isLocalStorage = () => (process.env.STORAGE_DRIVER ?? 'local') === 'local';

export function getStorage(): StorageDriver {
    const driver = process.env.STORAGE_DRIVER ?? 'local';
    switch (driver) {
        case 'local': return localDriver;
        // case 'r2': return r2Driver;   ← the only new file when migrating
        default: throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
    }
}