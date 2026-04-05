"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "./loader";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

// List of unimplemented routes that should show the WIP screen
const UNIMPLEMENTED_ROUTES = ["/settings", "/teacher/settings", "/teacher/messages"];

export function WorkInProgressWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="flex-1 overflow-auto bg-[rgb(241,241,241)] sm:mt-12 mt-16">
                <div className="p-4 w-full flex items-center justify-center min-h-[400px]">
                    <Loader />
                </div>
            </div>
        );
    }

    // Check if current path is in the unimplemented routes list
    const isUnimplemented = UNIMPLEMENTED_ROUTES.some((route) => pathname?.startsWith(route));

    if (isUnimplemented) {
        return (
            <div className="flex-1 overflow-auto bg-[rgb(241,241,241)] sm:mt-12 mt-16">
                <div className="p-4 w-full flex items-center justify-center min-h-[500px]">
                    <Card className="p-12 shadow-lg border rounded-[16px] max-w-md w-full text-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Construction className="w-10 h-10 text-primary" />
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
            </div>
        );
    }

    return <>{children}</>;
}

// Standalone component for direct use
export function WorkInProgress() {
    return (
        <div className="p-4 w-full flex items-center justify-center min-h-[500px]">
            <Card className="p-12 shadow-lg border rounded-[16px] max-w-md w-full text-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Construction className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">We&apos;re Working On It</h2>
                        <p className="text-muted-foreground">
                            This feature is coming soon. Our team is building something amazing for you!
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
