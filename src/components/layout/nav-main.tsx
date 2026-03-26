"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function isLinkActive(pathname: string, url: string): boolean {
    if (url === "#" || !url) return false;

    if (pathname === url) return true;

    if (url !== "/" && pathname.startsWith(url)) return true;

    return false;
}

export function NavMain({
    items
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const itemIsActive = item.isActive ?? isLinkActive(pathname, item.url);
                    const hasActiveChild = item.items?.some((subItem) => isLinkActive(pathname, subItem.url)) ?? false;

                    return item.items && item.items.length > 0 ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={itemIsActive || hasActiveChild}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className={cn(
                                            "transition-colors",
                                            (itemIsActive || hasActiveChild) && "bg-muted text-primary font-semibold"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className="font-semibold size-5"
                                                fill="#FFFFFF"
                                                stroke="#4A4A4A"
                                            />
                                        )}
                                        <span className="font-[550] text-[13px] text-text-primary">
                                            {item.title}
                                        </span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => {
                                            const subItemIsActive = isLinkActive(pathname, subItem.url);

                                            return (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        className={cn(subItemIsActive && "bg-muted text-primary font-semibold")}
                                                    >
                                                        <a href={subItem.url}>
                                                            <span className="font-[550] text-[13px] text-text-primary">
                                                                {subItem.title}
                                                            </span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                className={cn("transition-colors", itemIsActive && "bg-muted text-primary font-semibold")}
                            >
                                <a href={item.url}>
                                    {item.icon && (
                                        <item.icon
                                            className="font-semibold size-5"
                                            fill="#FFFFFF"
                                            stroke="#4A4A4A"
                                        />
                                    )}
                                    <span className="font-[550] text-[13px] text-text-primary">
                                        {item.title}
                                    </span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
