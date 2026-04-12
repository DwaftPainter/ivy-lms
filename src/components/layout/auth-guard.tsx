"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { fetchMe, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await fetchMe();
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [fetchMe]);

    // Redirect to login if not authenticated and not loading
    useEffect(() => {
        if (!isCheckingAuth && !isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isCheckingAuth, isLoading, isAuthenticated, router]);

    // Show loading state while checking auth or if still loading
    if (isCheckingAuth || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // If authenticated, render children
    if (isAuthenticated) {
        return children;
    }

    // If not authenticated, we'll redirect in the effect above
    return null;
};

export default AuthGuard;
