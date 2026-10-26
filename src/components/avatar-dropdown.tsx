"use client"

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLinkItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserRole } from "@/types/next-auth";

type AvatarDropdownProps = {
    role: UserRole;
    name: string;
    avatarUrl: string | null;
}

export function AvatarDropdown({ role, name, avatarUrl }: AvatarDropdownProps) {
    const t = useTranslations('nav');
    const profileLink = role === 'customer' ? '/account' : '/technician/profile';
    const profileLabel = role === 'customer' ? t('account') : t('profile');

    return (
        <DropdownMenu>
            {/* The avatar is the button's only content, so it needs its own accessible name */}
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" aria-label={t('accountMenu')}><Avatar>
                {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                <AvatarFallback>{name.slice(0, 2) || '?'}</AvatarFallback>
            </Avatar></Button>} />
            <DropdownMenuContent className="w-40">
                <DropdownMenuGroup>
                    {/* i18n Link keeps the current locale prefix (next/link would drop it) */}
                    <DropdownMenuLinkItem render={<Link href={profileLink} />}>
                        {profileLabel}
                    </DropdownMenuLinkItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>{t('signOut')}</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
