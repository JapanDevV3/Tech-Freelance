import { cn } from '@/lib/utils';

export type TimelineItem = { key: string; label: string; state: 'done' | 'current' | 'pending'; timestamp?: string };

// Vertical status stepper for the order detail page — mirrors the "สถานะงาน"
// list in the Framer design (done / current / pending dots + connecting rail).
export function OrderTimeline({ steps, pendingLabel }: { steps: TimelineItem[], pendingLabel: string }) {
    return (
        <ol>
            {steps.map((step, i) => (
                <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < steps.length - 1 && (
                        <span
                            className={cn(
                                'absolute top-5 left-2.25 h-full w-px',
                                step.state === 'done' ? 'bg-primary' : 'bg-border',
                            )}
                        />
                    )}
                    <span
                        className={cn(
                            'z-10 mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full',
                            step.state === 'done' && 'bg-primary text-primary-foreground',
                            step.state === 'current' && 'bg-primary/20 ring-2 ring-primary',
                            step.state === 'pending' && 'bg-muted ring-1 ring-border',
                        )}
                    >
                        {step.state === 'done' && <span className="text-[10px]">✓</span>}
                        {step.state === 'current' && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    <div>
                        <p className={cn('text-body font-medium', step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground')}>
                            {step.label}
                        </p>
                        {step.timestamp && <p className="mt-0.5 text-small text-muted-foreground">{step.timestamp}</p>}
                        {!step.timestamp && step.state === 'pending' && (
                            <p className="mt-0.5 text-small text-muted-foreground">{pendingLabel}</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
