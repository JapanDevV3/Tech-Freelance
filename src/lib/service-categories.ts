export const SERVICE_CATEGORIES = [
    'install_windows',
    'build_pc',
    'network',
    'software',
    'other',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];