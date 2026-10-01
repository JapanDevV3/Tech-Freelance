'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatBubble } from '@/components/chat/chat-bubble';
import type { ChatMessage } from '@/lib/mock/marketplace';

// Chat has no backend/websocket yet — messages the visitor sends only live in
// local component state, so the thread resets on reload. Good enough to show
// the interaction; swap for a real subscription once chat exists server-side.
export function ChatComposer({ initialMessages }: { initialMessages: ChatMessage[] }) {
    const t = useTranslations('chat');
    const [messages, setMessages] = useState(initialMessages);
    const [draft, setDraft] = useState('');

    function send() {
        const text = draft.trim();
        if (!text) return;
        setMessages((prev) => [
            ...prev,
            { id: `local-${prev.length}`, author: 'me', text, time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) },
        ]);
        setDraft('');
    }

    return (
        <>
            <div className="space-y-3 p-5">
                {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                ))}
            </div>
            <div className="flex gap-2 border-t border-border p-4">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder={t('placeholder')}
                    className="h-10 flex-1"
                />
                <Button onClick={send} className="h-10">{t('send')}</Button>
            </div>
        </>
    );
}
