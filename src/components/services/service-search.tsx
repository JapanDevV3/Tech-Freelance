'use client';

import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from '@/components/ui/input';
import { useFilters } from '@/hooks/use-filters';

export function ServiceSearch({ placeholder }: { placeholder: string }) {
    const { get, setParam } = useFilters();
    const [value, setValue] = useState(get('q') ?? '');
    const [isPending, startTransition] = useTransition();
    const mounted = useRef(false);

    // Debounce: wait 350ms after the user stops typing before navigating,
    // so we don't fire a request on every keystroke.
    useEffect(() => {
        if (!mounted.current) { mounted.current = true; return; } // skip initial mount
        /* const id = setTimeout(() => {
            startTransition(() => setParam('q', value || null));
        }, 350);
        return clearTimeout(id); */
    }, [value])

    return (
        <Input type="search" value={value} placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            className={`h-11 max-w-xl ${isPending ? 'opacity-70' : ''}`} />
    );
}