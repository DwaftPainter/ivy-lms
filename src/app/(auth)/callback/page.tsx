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
            <div className="flex flex-col h-screen lg:basis-1/2 w-full justify-center items-center px-6">
                <div className="w-full max-w-md space-y-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertTitle>Sign-in failed</AlertTitle>
                        <AlertDescription>
                            {error.message || "Unable to complete Google sign-in. Please try again."}
                        </AlertDescription>
                    </Alert>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Back to log in</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen lg:basis-1/2 w-full justify-center items-center gap-4 px-6 text-center">
            <Loader />
            <div role="status" aria-live="polite" className="space-y-1">
                <p className="text-sm font-medium text-foreground">Signing you in…</p>
                <p className="text-xs text-muted-foreground">
                    Completing authentication and redirecting to your portal.
                </p>
            </div>
        </div>
    );
};

export default CallbackPage;
