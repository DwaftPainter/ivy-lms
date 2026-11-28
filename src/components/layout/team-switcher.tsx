"use client";

import Image from "next/image";
import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

interface TeamSwitcherProps {
    homeUrl?: string;
}

const TeamSwitcher = ({ homeUrl = "/" }: TeamSwitcherProps) => {
    const { isMobile, setOpenMobile, skipRestoreFocusRef } = useSidebar();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    size="lg"
                    tooltip="IVY LMS"
                    className="hover:bg-background/70 active:bg-background/80"
                >
                    <Link
                        href={homeUrl}
                        aria-label="IVY LMS home"
                        onClick={() => {
                            if (isMobile) {
                                skipRestoreFocusRef.current = true;
                                setOpenMobile(false);
                            }
                        }}
                    >
                        <Image
                            src="/IVY_IELTS_Logo.svg"
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 shrink-0 rounded-md"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold tracking-tight text-foreground">
                                IVY LMS
                            </span>
                        </div>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default TeamSwitcher;
