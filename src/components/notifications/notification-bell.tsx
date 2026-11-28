"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon, ListFilterIcon } from "lucide-react";
import { format } from "date-fns";
import { useNotificationStore, type Notification } from "@/store/notification.store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

export function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        return true;
    });

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="relative">
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={
                            unreadCount > 0
                                ? `Notifications (${unreadCount} unread)`
                                : "Notifications"
                        }
                        className="relative size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <BellIcon className="size-4" aria-hidden="true" />
                    </Button>
                </PopoverTrigger>
                {unreadCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background tabular-nums"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </div>
            <PopoverContent
                className="w-[min(24rem,calc(100vw-1.5rem))] p-0"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-base font-semibold text-foreground">
                        Alerts
                    </h3>
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Filter notifications"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <ListFilterIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setFilter("all")}
                                    className={cn(filter === "all" && "bg-muted")}
                                >
                                    All notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilter("unread")}
                                    className={cn(filter === "unread" && "bg-muted")}
                                >
                                    Unread only
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Mark all as read"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            title="Mark all as read"
                        >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[360px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent motion-reduce:animate-none" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <Empty className="border-none py-12">
                            <EmptyHeader>
                                <EmptyTitle>No notifications</EmptyTitle>
                                <EmptyDescription>You&apos;re all caught up!</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <ul className="divide-y divide-border">
                            {filteredNotifications.map((notification) => (
                                <li key={notification.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full px-4 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                                            !notification.isRead && "bg-primary/4"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 shrink-0">
                                                <div
                                                    className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        notification.isRead
                                                            ? "border border-muted-foreground/40 bg-transparent"
                                                            : "bg-primary"
                                                    )}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(
                                                            new Date(notification.createdAt),
                                                            "MMM d 'at' h:mm a"
                                                        )}
                                                    </span>
                                                </div>
                                                <h4
                                                    className={cn(
                                                        "mb-1 text-sm font-semibold",
                                                        !notification.isRead
                                                            ? "text-foreground"
                                                            : "text-text-primary"
                                                    )}
                                                >
                                                    {notification.title}
                                                </h4>
                                                <p className="line-clamp-3 text-sm text-muted-foreground">
                                                    {notification.body}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ScrollArea>

                {filteredNotifications.length > 0 && (
                    <div className="border-t border-border px-4 py-2.5 text-center">
                        <p className="text-xs text-muted-foreground">
                            {filter === "unread" && filteredNotifications.length === 0
                                ? "No unread notifications"
                                : "No more alerts"}
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
