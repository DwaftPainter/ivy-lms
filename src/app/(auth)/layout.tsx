"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const { isAuthenticated, user } = useAuthStore();

    React.useEffect(() => {
        if (user && isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    return (
        <div className="flex w-screen h-screen">
            {children}
            <div className="basis-1/2 lg:block hidden h-full bg-linear-to-r from-[oklch(0.55_0.19_20)] via-[oklch(0.52_0.19_27)] to-[oklch(0.48_0.18_35)]" />
        </div>
    );
};

export default AuthLayout;
