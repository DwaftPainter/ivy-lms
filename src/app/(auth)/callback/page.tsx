"use client";

import React from "react";
import Loader from "@/components/custom-ui/loader";
import { useAuth0 } from "@auth0/auth0-react";
import { GoogleLoginPayload, useAuthStore } from "@/store/auth.store";

const CallbackPage = () => {
    const { user, isAuthenticated } = useAuth0();
    const { loginWithGoogle } = useAuthStore();
    React.useEffect(() => {
        if (user && isAuthenticated && user?.email) {
            loginWithGoogle(user as GoogleLoginPayload);
        }
    }, [user, isAuthenticated]);

    return (
        <div className="flex h-screen w-1/2 justify-center items-center">
            <Loader />
        </div>
    );
};

export default CallbackPage;
