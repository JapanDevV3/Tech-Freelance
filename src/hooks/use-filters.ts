'use client';

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

export function useFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    function setParam(key: string, value: string | null ){
        const params = new URLSearchParams(searchParams.toString());
        if(value === null || value === '') params.delete(key);
        else params.set(key, value);

        router.replace({pathname, query: Object.fromEntries(params)}, {scroll: false});
    }

    return { get: (k: string) => searchParams.get(k), setParam}
}