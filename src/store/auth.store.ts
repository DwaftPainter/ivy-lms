import { create } from "zustand";

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
    login: (data: LoginPayload) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
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

    loginWithGoogle: async (payload) => {
        set({ isLoading: true });

        try {
            const builtPayload = {
                email: payload.email,
                avatarUrl: payload.picture,
                firstName: payload.given_name,
                lastName: payload.family_name
            };
            const res = await fetch("/api/auth/google", {
                method: "POST",
                body: JSON.stringify(builtPayload),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            set({
                user: data.data,
                isAuthenticated: true
            });
        } catch (error) {
            console.error("Login error", error);
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (payload) => {
        set({ isLoading: true });

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            set({
                user: data.data,
                isAuthenticated: true
            });
        } catch (error) {
            console.error("Login error", error);
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (payload) => {
        set({ isLoading: true });

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            set({
                user: data.data,
                isAuthenticated: true
            });
        } catch (error) {
            console.error("Register error", error);
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await fetch("/api/auth/logout");

        set({
            user: null,
            isAuthenticated: false
        });
    }
}));
