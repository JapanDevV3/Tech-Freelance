'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { cn } from '@/lib/utils';

// One exclusive choice between a few short options (รีโมท / ถึงที่, card / PromptPay).
// Built on Base UI's RadioGroup, so it *is* a radio group to assistive tech:
// arrow keys move the selection, Tab enters and leaves the group once.
// More than ~3 options or long labels → use a Select instead.
export type SegmentedOption<T extends string> = { value: T; label: React.ReactNode };

type SegmentedControlProps<T extends string> = {
    value: T;
    onValueChange: (value: T) => void;
    options: readonly SegmentedOption<T>[];
    /** default sits next to 28px inputs in a form; lg is a page-level switch */
    size?: 'default' | 'lg';
    name?: string;
    onBlur?: () => void;
    /** react-hook-form's field.ref, so a validation error can focus the group */
    inputRef?: React.Ref<HTMLInputElement>;
    className?: string;
    'aria-labelledby'?: string;
    'aria-label'?: string;
};

export function SegmentedControl<T extends string>({
    value, onValueChange, options, size = 'default', name, onBlur, inputRef, className, ...aria
}: SegmentedControlProps<T>) {
    return (
        <RadioGroup
            value={value}
            onValueChange={(v) => onValueChange(v as T)}
            name={name}
            inputRef={inputRef}
            onBlur={onBlur}
            className={cn('grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1', className)}
            {...aria}
        >
            {options.map((option) => (
                <Radio.Root
                    key={option.value}
                    value={option.value}
                    className={cn(
                        'flex cursor-pointer items-center justify-center rounded-md px-3 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none select-none',
                        'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30',
                        'data-checked:bg-card data-checked:text-foreground data-checked:shadow-sm',
                        'data-disabled:pointer-events-none data-disabled:opacity-50',
                        size === 'lg' ? 'h-9 pointer-coarse:h-11' : 'h-7 pointer-coarse:h-10',
                    )}
                >
                    {option.label}
                </Radio.Root>
            ))}
        </RadioGroup>
    );
}
