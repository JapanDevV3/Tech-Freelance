'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { IMAGE_CONTENT_TYPES, SERVICE_IMAGE_MAX_COUNT, UPLOAD_PURPOSES } from '@/lib/uploads/constants';

type Props = { value: File[]; onChange: (files: File[]) => void; onBlur: () => void; invalid?: boolean; describedBy?: string };

export function ImageDropzone({ value, onChange, onBlur, invalid, describedBy }: Props) {
    const t = useTranslations('serviceForm');
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    function addFiles(list: FileList | null) {
        if (!list?.length) return;
        onChange([...value, ...Array.from(list)]); // zod is the single source of truth for errors
        onBlur();                                   // mark touched → error shows immediately
    }

    return (
        <div className="grid gap-3">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                // aria-invalid isn't valid on role=button; the error is linked via
                // aria-describedby and announced by <FieldError role="alert">
                aria-describedby={describedBy}
                className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border border-dashed p-6 text-center transition-colors',
                    dragOver ? 'border-primary bg-accent-soft' : 'border-border-strong hover:bg-accent',
                    invalid && 'border-destructive',
                )}
            >
                <span className="text-sm font-medium text-foreground">{t('imagesDrop')}</span>
                <span className="text-xs text-muted-foreground">
                    {t('imagesHint', { max: SERVICE_IMAGE_MAX_COUNT, sizeMb: UPLOAD_PURPOSES.serviceImage.maxBytes / 1024 / 1024 })}
                </span>
            </button>
            <input
                ref={inputRef} type="file" hidden multiple accept={IMAGE_CONTENT_TYPES.join(',')}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} // allow re-picking the same file
            />

            {value.length > 0 && (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {value.map((file, i) => (
                        <li key={`${file.name}-${file.lastModified}-${i}`} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                            <Thumb file={file} alt={file.name} />
                            {i === 0 && (
                                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">{t('imagesCover')}</span>
                            )}
                            <button
                                type="button"
                                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                                aria-label={t('imagesRemove', { name: file.name })}
                                className="absolute right-1 top-1 rounded-full bg-background/80 px-1.5 text-xs"
                            >✕</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// URL is created AND revoked inside the same effect, so React StrictMode's
// mount→unmount→mount cycle produces a fresh URL instead of a revoked one.
function Thumb({ file, alt }: { file: File; alt: string }) {
    const imgRef = useRef<HTMLImageElement>(null);
    useEffect(() => {
        const url = URL.createObjectURL(file);
        if (imgRef.current) imgRef.current.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);
    // eslint-disable-next-line @next/next/no-img-element -- blob: preview, next/image adds nothing
    return <img ref={imgRef} alt={alt} className="size-full object-cover" />;
}