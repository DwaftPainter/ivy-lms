import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import type { ApiResponse } from "@/types/common";

export type Notification = {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
};

type NotificationState = {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearError: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<ApiResponse<Notification[]>>("/api/notifications");
            const notifications = response.data || [];
            const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to fetch notifications",
                isLoading: false
            });
        }
    },

    markAsRead: async (notificationId: string) => {
        try {
            await apiFetch(`/api/notifications/${notificationId}/read`, {
                method: "PATCH"
            });

            const { notifications } = get();
            const updatedNotifications = notifications.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
            );
            const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
            set({ notifications: updatedNotifications, unreadCount });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    },

    markAllAsRead: async () => {
        try {
            await apiFetch("/api/notifications/read-all", {
                method: "PATCH"
            });

            const { notifications } = get();
            const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }));
            set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    },

    clearError: () => set({ error: null })
}));
