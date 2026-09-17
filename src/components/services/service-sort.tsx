'use client';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useFilters } from '@/hooks/use-filters';

type Labels = { newest: string; priceAsc: string; priceDesc: string };

export function ServiceSort({ labels }: { labels: Labels }) {
    const { get, setParam } = useFilters();
    const current = get('sort') ?? 'newest';
    const items = {
        newest: labels.newest,
        price_asc: labels.priceAsc,
        price_desc: labels.priceDesc,
    };

    return (
        <Select value={current} onValueChange={(v) => setParam('sort', v)} items={items}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">{labels.newest}</SelectItem>
                <SelectItem value="price_asc">{labels.priceAsc}</SelectItem>
                <SelectItem value="price_desc">{labels.priceDesc}</SelectItem>
            </SelectContent>
        </Select>
    );
}