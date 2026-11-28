"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Loader from "./loader";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

// List of unimplemented routes that should show the WIP screen
const UNIMPLEMENTED_ROUTES = ["/settings", "/teacher/settings", "/teacher/messages"];

const emptySubscribe = () => () => {};

export function WorkInProgressWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="flex flex-1 min-w-0 items-center justify-center bg-background p-4 md:overflow-y-auto">
                <div className="flex min-h-[400px] w-full items-center justify-center">
                    <Loader />
                </div>
            </div>
        );
    }

    // Check if current path is in the unimplemented routes list
    const isUnimplemented = UNIMPLEMENTED_ROUTES.some((route) => pathname?.startsWith(route));

    if (isUnimplemented) {
        return (
            <main className="flex flex-1 min-w-0 items-center justify-center bg-background p-4 md:overflow-y-auto">
                <div className="flex min-h-[460px] w-full items-center justify-center">
                    <Card className="w-full max-w-md rounded-2xl border p-10 text-center shadow-xs">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <Construction className="h-10 w-10 text-primary" aria-hidden="true" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-foreground">
                                    We&apos;re Working On It
                                </h1>
                                <p className="text-muted-foreground">
                                    This feature is coming soon. Our team is building something
                                    amazing for you!
                                </p>
                            </div>
                            <div className="py-4">
                                <Loader />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Check back later for updates.
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

    return <>{children}</>;
}

// Standalone component for direct use
export function WorkInProgress() {
    return (
        <div className="flex min-h-[460px] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md rounded-2xl border p-10 text-center shadow-xs">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Construction className="h-10 w-10 text-primary" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            We&apos;re Working On It
                        </h2>
                        <p className="text-muted-foreground">
                            This feature is coming soon. Our team is building something amazing for
                            you!
                        </p>
                    </div>
                    <div className="py-4">
                        <Loader />
                    </div>
                    <p className="text-sm text-muted-foreground">Check back later for updates.</p>
                </div>
            </Card>
        </div>
    );
}
