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
                <div className="border-gradient size-9 flex items-center justify-center cursor-pointer">
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            aria-label={
                                unreadCount > 0
                                    ? `Notifications (${unreadCount} unread)`
                                    : "Notifications"
                            }
                            className="p-1.5 flex items-center h-9 w-9 cursor-pointer relative"
                        >
                            <span className="flex items-center justify-center size-full">
                                <BellIcon className="text-text-secondary size-4" aria-hidden="true" />
                            </span>
                        </button>
                    </PopoverTrigger>
                </div>
                {unreadCount > 0 && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-primary"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </div>
            <PopoverContent
                className="w-[400px] p-0"
                align="end"
                sideOffset={8}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-lg text-gray-900">
                        Alerts
                    </h3>
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Filter notifications"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                >
                                    <ListFilterIcon className="h-4 w-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setFilter("all")}
                                    className={cn(
                                        filter === "all" && "bg-gray-100"
                                    )}
                                >
                                    All notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setFilter("unread")}
                                    className={cn(
                                        filter === "unread" && "bg-gray-100"
                                    )}
                                >
                                    Unread only
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Mark all as read"
                            className="h-8 w-8 text-gray-500 hover:text-gray-700"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            title="Mark all as read"
                        >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <Empty className="py-12 border-none">
                            <EmptyHeader>
                                <EmptyTitle>No notifications</EmptyTitle>
                                <EmptyDescription>You&apos;re all caught up!</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className={cn(
                                        "px-4 py-4 cursor-pointer transition-colors hover:bg-gray-50",
                                        !notification.isRead && "bg-gray-50/50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div
                                                className={cn(
                                                    "w-2.5 h-2.5 rounded-full",
                                                    notification.isRead
                                                        ? "bg-transparent border border-gray-300"
                                                        : "bg-blue-600"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-gray-500">
                                                    {format(
                                                        new Date(
                                                            notification.createdAt
                                                        ),
                                                        "MMM d 'at' h:mm a"
                                                    )}
                                                </span>
                                            </div>
                                            <h4
                                                className={cn(
                                                    "text-sm font-semibold mb-1",
                                                    !notification.isRead
                                                        ? "text-gray-900"
                                                        : "text-gray-700"
                                                )}
                                            >
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 line-clamp-3">
                                                {notification.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {filteredNotifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            {filter === "unread" &&
                            filteredNotifications.length === 0
                                ? "No unread notifications"
                                : "No more alerts"}
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
