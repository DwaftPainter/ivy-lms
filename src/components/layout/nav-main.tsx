"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const ROOT_PORTAL_PATHS = new Set(["/", "/teacher", "/dashboard", "/admin"]);

function isLinkActive(pathname: string, url: string): boolean {
    if (url === "#" || !url) return false;

    if (pathname === url) return true;

    if (!ROOT_PORTAL_PATHS.has(url) && pathname.startsWith(`${url}/`)) return true;

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
    const { isMobile, setOpenMobile, skipRestoreFocusRef } = useSidebar();

    const handleMobileNav = () => {
        if (isMobile) {
            skipRestoreFocusRef.current = true;
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const itemIsActive = item.isActive ?? isLinkActive(pathname, item.url);
                    const hasActiveChild =
                        item.items?.some((subItem) => isLinkActive(pathname, subItem.url)) ?? false;

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
                                            "group/menu-button transition-colors hover:bg-background/70 hover:text-foreground",
                                            (itemIsActive || hasActiveChild) &&
                                                "border border-border/80 bg-background font-semibold text-foreground shadow-xs max-md:border-primary/20 max-md:bg-primary/8 max-md:text-primary"
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    "size-4 shrink-0 transition-colors",
                                                    itemIsActive || hasActiveChild
                                                        ? "text-primary"
                                                        : "text-muted-foreground group-hover/menu-button:text-foreground"
                                                )}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="text-[13px]">{item.title}</span>
                                        <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                                                        isActive={subItemIsActive}
                                                        className={cn(
                                                            subItemIsActive &&
                                                                "bg-background font-semibold text-primary shadow-xs"
                                                        )}
                                                    >
                                                        <Link
                                                            href={subItem.url}
                                                            aria-current={
                                                                subItemIsActive ? "page" : undefined
                                                            }
                                                            onClick={handleMobileNav}
                                                        >
                                                            <span className="text-[13px]">
                                                                {subItem.title}
                                                            </span>
                                                        </Link>
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
                                isActive={itemIsActive}
                                tooltip={item.title}
                                className={cn(
                                    "group/menu-button transition-colors hover:bg-background/70 hover:text-foreground",
                                    "data-[active=true]:border data-[active=true]:border-border/80 data-[active=true]:bg-background data-[active=true]:font-semibold data-[active=true]:text-foreground data-[active=true]:shadow-xs",
                                    "max-md:data-[active=true]:border-primary/20 max-md:data-[active=true]:bg-primary/8 max-md:data-[active=true]:text-primary"
                                )}
                            >
                                <Link
                                    href={item.url}
                                    aria-current={itemIsActive ? "page" : undefined}
                                    onClick={handleMobileNav}
                                >
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                "size-4 shrink-0 transition-colors",
                                                itemIsActive
                                                    ? "text-primary"
                                                    : "text-muted-foreground group-hover/menu-button:text-foreground"
                                            )}
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            "text-[13px]",
                                            itemIsActive ? "font-semibold" : "font-medium text-text-primary group-hover/menu-button:text-foreground"
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
