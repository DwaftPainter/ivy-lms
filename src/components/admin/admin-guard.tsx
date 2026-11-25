"use client";

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    // const { user, isAuthenticated, isLoading } = useAuthStore();
    // const router = useRouter();

    // useEffect(() => {
    //     // Wait for auth to load
    //     if (isLoading) return;

    //     // Not authenticated - redirect to login
    //     if (!isAuthenticated) {
    //         router.push("/login?redirect=/admin");
    //         return;
    //     }

    //     // Authenticated but not admin - redirect to home
    //     if (user?.role !== "admin") {
    //         router.push("/");
    //     }
    // }, [user, isAuthenticated, isLoading, router]);

    // // Show nothing while checking auth
    // if (isLoading || !isAuthenticated || user?.role !== "admin") {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    //         </div>
    //     );
    // }

    return <>{children}</>;
}
