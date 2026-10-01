export const SERVICE_CATEGORIES = [
    'install_windows',
    'build_pc',
    'network',
    'software',
    'other',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// Narrows free-text values (e.g. legacy `technician_profiles.skills` rows) to known categories
export function isServiceCategory(value: string): value is ServiceCategory {
    return (SERVICE_CATEGORIES as readonly string[]).includes(value);
}

export const SERVICE_DURATIONS = ['same_day', 'days_1_2', 'days_3_5', 'week_plus'] as const;
export type ServiceDuration = (typeof SERVICE_DURATIONS)[number];