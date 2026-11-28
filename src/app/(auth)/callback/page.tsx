"use client";

import React from "react";
import Link from "next/link";
import Loader from "@/components/custom-ui/loader";
import { useAuth0 } from "@auth0/auth0-react";
import { GoogleLoginPayload, useAuthStore } from "@/store/auth.store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const CallbackPage = () => {
    const { user, isAuthenticated, error } = useAuth0();
    const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
    React.useEffect(() => {
        if (user && isAuthenticated && user?.email) {
            loginWithGoogle(user as GoogleLoginPayload);
        }
    }, [user, isAuthenticated, loginWithGoogle]);

    if (error) {
        return (
            <div className="space-y-5">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sign-in failed</h1>
                <Alert variant="destructive">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    <AlertTitle>Google sign-in</AlertTitle>
                    <AlertDescription>
                        {error.message || "Unable to complete Google sign-in. Please try again."}
                    </AlertDescription>
                </Alert>
                <Button asChild variant="outline" className="min-h-11 w-full">
                    <Link href="/login">Back to sign in</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <Loader />
            <div role="status" className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Signing you in…</h1>
                <p className="text-sm text-muted-foreground">
                    Completing authentication and redirecting to your portal.
                </p>
            </div>
        </div>
    );
};

export default CallbackPage;
