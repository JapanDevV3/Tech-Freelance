'use client'

import { useTranslations } from "next-intl";
import { cn } from '@/lib/utils';
import { useState } from "react";
import Image from "next/image";

type Props = { images: string[], title: string };

export function ServiceGallery({ images, title }: Props) {
    const t = useTranslations('serviceDetail');
    const [active, setActive] = useState(0);
    const current = images[active];

    return (
        <div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-sunken">
                {current && (
                    <Image
                        key={current}
                        src={current}
                        alt={title}
                        fill
                        preload // hero is this page's LCP element (`priority` is deprecated in Next 16)
                        sizes="(min-width: 1024px) 860px, 100vw"
                        className="object-cover"
                    />
                )}
            </div>

            {images.length > 1 && (
                <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <li key={src} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setActive(i)}
                                aria-label={t('showImage', { index: i + 1, total: images.length })}
                                aria-current={i === active}
                                className={cn(
                                    'relative block size-16 overflow-hidden rounded-lg border-2 transition sm:size-20',
                                    i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                                )}
                            >
                                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}