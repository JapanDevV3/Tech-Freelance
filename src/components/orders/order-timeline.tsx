import { cn } from '@/lib/utils';
import type { OrderStep } from '@/lib/mock/marketplace';

// Vertical status stepper for the order detail page — mirrors the "สถานะงาน"
// list in the Framer design (done / current / pending dots + connecting rail).
export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
    return (
        <ol>
            {steps.map((step, i) => (
                <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < steps.length - 1 && (
                        <span
                            className={cn(
                                'absolute top-5 left-[9px] h-full w-px',
                                step.state === 'done' ? 'bg-primary' : 'bg-border',
                            )}
                        />
                    )}
                    <span
                        className={cn(
                            'z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full',
                            step.state === 'done' && 'bg-primary text-primary-foreground',
                            step.state === 'current' && 'bg-primary/20 ring-2 ring-primary',
                            step.state === 'pending' && 'bg-muted ring-1 ring-border',
                        )}
                    >
                        {step.state === 'done' && <span className="text-[10px]">✓</span>}
                        {step.state === 'current' && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    <div>
                        <p className={cn('text-sm font-medium', step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground')}>
                            {step.label}
                        </p>
                        {step.timestamp && <p className="mt-0.5 text-xs text-muted-foreground">{step.timestamp}</p>}
                        {!step.timestamp && step.state === 'pending' && (
                            <p className="mt-0.5 text-xs text-muted-foreground">รอดำเนินการ</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
