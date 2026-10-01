import { cn } from '@/lib/utils';

// Reusable metric tile — dashboard, customer home, and account pages all show
// small "number + label (+ hint)" stats. One component keeps that layout consistent
// instead of re-hand-rolling the same three <div>s on every page.
type StatCardProps = {
    label: string;
    value: string;
    hint?: string;
    hintTone?: 'positive' | 'muted';
    className?: string;
};

export function StatCard({ label, value, hint, hintTone = 'muted', className }: StatCardProps) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            {hint && (
                <p className={cn('mt-1 text-xs', hintTone === 'positive' ? 'text-primary' : 'text-muted-foreground')}>
                    {hint}
                </p>
            )}
        </div>
    );
}
