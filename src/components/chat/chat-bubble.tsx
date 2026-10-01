import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/mock/marketplace';

export function ChatBubble({ message }: { message: ChatMessage }) {
    const mine = message.author === 'me';
    return (
        <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[80%] rounded-xl px-4 py-2.5 text-sm',
                    mine ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground',
                )}
            >
                <p>{message.text}</p>
                <p className={cn('mt-1 text-[0.65rem]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {message.time}
                </p>
            </div>
        </div>
    );
}
