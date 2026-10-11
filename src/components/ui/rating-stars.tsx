'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

type RatingStarsProps = {
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

const SIZE_CLASS = { sm: 'size-3', md: 'size-4', lg: 'size-6' } as const;

// Read-only rating display — technician cards, profile headers, review lists.
export function RatingStars({ value, max = 5, size = 'sm', className }: RatingStarsProps) {
    return (
        <span className={cn('inline-flex items-center gap-0.5 text-star', className)} aria-label={`${value} / ${max}`}>
            {Array.from({ length: max }, (_, i) => (
                <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    className={cn(SIZE_CLASS[size], i < Math.round(value) ? 'fill-star text-star' : 'fill-transparent text-border-strong')}
                />
            ))}
        </span>
    );
}

type RatingInputProps = {
    name: string;
    defaultValue?: number;
    max?: number;
    onChange?: (value: number) => void;
    className?: string;
};

// Interactive rating picker for the review form. Keeps its own state and mirrors
// the chosen value into a hidden input so it still participates in FormData.
export function RatingInput({ name, defaultValue = 0, max = 5, onChange, className }: RatingInputProps) {
    const [value, setValue] = useState(defaultValue);
    const [hovered, setHovered] = useState<number | null>(null);
    const display = hovered ?? value;

    function pick(next: number) {
        setValue(next);
        onChange?.(next);
    }

    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            <input type="hidden" name={name} value={value} />
            {Array.from({ length: max }, (_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => pick(starValue)}
                        onMouseEnter={() => setHovered(starValue)}
                        onMouseLeave={() => setHovered(null)}
                        className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        <HugeiconsIcon
                            icon={StarIcon}
                            className={cn('size-7 transition-colors', starValue <= display ? 'fill-star text-star' : 'fill-transparent text-border-strong')}
                        />
                    </button>
                );
            })}
        </span>
    );
}
