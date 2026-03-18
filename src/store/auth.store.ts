import { UseFormReturn } from "react-hook-form";
import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";

type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
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
    login: (data: LoginPayload, form: UseFormReturn<LoginPayload>) => Promise<void>;
    register: (data: RegisterPayload, form: UseFormReturn<RegisterPayload>) => Promise<void>;
    loginWithGoogle: (data: GoogleLoginPayload) => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user
        }),

    login: async (payload, form) => {
        set({ isLoading: true });

        try {
            const data = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            set({
                user: data.data,
                isAuthenticated: true
            });
        } catch (err: any) {
            console.error("Login error:", err);

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
        } catch (err: any) {
            console.error("Register error:", err);

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
        } catch (error) {
            console.error("Google login error:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await apiFetch("/api/auth/logout");

        set({
            user: null,
            isAuthenticated: false
        });
    }
}));
