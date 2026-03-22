"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const fetchMe = useAuthStore((s) => s.fetchMe);

    useEffect(() => {
        fetchMe();
    }, []);

    return children;
};

export default AuthGuard;
