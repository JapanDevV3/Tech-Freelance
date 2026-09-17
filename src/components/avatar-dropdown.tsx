"use client"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type avatarDropdownProps = {
    role: string;
}

export function AvatarDropdown({role} : avatarDropdownProps) {
    const t = useTranslations('nav');
    const profileLink = role === 'customer' ? '/profile' : '/technician/profile';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full"><Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar></Button>} />
            <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Link href={profileLink}>
                            {t('profile')}
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>{t('signOut')}</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
