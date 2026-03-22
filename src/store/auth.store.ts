import { UseFormReturn } from "react-hook-form";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api-fetch";
import { ApiResponse } from "@/types/common";

type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    role?: "admin" | "instructor" | "student";
};

type RegisterPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

type LoginPayload = {
    email: string;
    password: string;
};

export type GoogleLoginPayload = {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    name: string;
    nickname: string;
    picture: string;
    sub: string;
    updated_at: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setUser: (user: User | null) => void;
    fetchMe: () => Promise<void>;
    login: (data: LoginPayload, form: UseFormReturn<LoginPayload>) => Promise<void>;
    register: (data: RegisterPayload, form: UseFormReturn<RegisterPayload>) => Promise<void>;
    loginWithGoogle: (data: GoogleLoginPayload) => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user
                }),

            fetchMe: async () => {
                try {
                    set({ isLoading: true });

                    const data = await apiFetch("/api/auth/me");

                    set({
                        user: data.data,
                        isAuthenticated: true
                    });
                } catch {
                    set({
                        user: null,
                        isAuthenticated: false
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            login: async (payload, form) => {
                set({ isLoading: true });

                try {
                    const data = await apiFetch<ApiResponse<any>>("/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });

                    set({
                        user: data.data,
                        isAuthenticated: true
                    });

                    if (data.success && data.redirectTo) {
                        window.location.href = data.redirectTo;
                    }
                } catch (err: any) {
                    const error = err?.error;

                    if (error?.field) {
                        form.setError(error.field, {
                            type: "server",
                            message: error.message
                        });
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (payload, form) => {
                set({ isLoading: true });

                try {
                    const data = await apiFetch("/api/auth/register", {
                        method: "POST",
                        body: JSON.stringify(payload)
                    });

                    set({
                        user: data.data,
                        isAuthenticated: true
                    });

                    if (data.success && data.redirectTo) {
                        window.location.href = data.redirectTo;
                    }
                } catch (err: any) {
                    const error = err?.error;

                    if (error?.field) {
                        form.setError(error.field, {
                            type: "server",
                            message: error.message
                        });
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            loginWithGoogle: async (payload) => {
                set({ isLoading: true });

                try {
                    const builtPayload = {
                        email: payload.email,
                        avatarUrl: payload.picture,
                        firstName: payload.given_name,
                        lastName: payload.family_name
                    };

                    const data = await apiFetch("/api/auth/google", {
                        method: "POST",
                        body: JSON.stringify(builtPayload)
                    });

                    set({
                        user: data.data,
                        isAuthenticated: true
                    });

                    if (data.success && data.redirectTo) {
                        window.location.href = data.redirectTo;
                    }
                } catch (error) {
                    console.error("Google login error:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    await apiFetch("/api/auth/logout", {
                        method: "POST"
                    });
                } catch (error) {
                    console.error("Logout error:", error);
                }

                await useAuthStore.persist.clearStorage();

                set({
                    user: null,
                    isAuthenticated: false
                });

                window.location.href = "/login";
            }
        }),
        {
            name: "ivy-auth-storage",

            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);
