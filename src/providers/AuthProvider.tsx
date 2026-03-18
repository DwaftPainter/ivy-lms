"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <Auth0Provider
            domain={"dev-enb6ymghp04ppafs.us.auth0.com"}
            clientId={"vZsE8YSECyBjuU3L2SO5lGdnHnzyNcTQ"}
            authorizationParams={{
                redirect_uri: typeof window !== "undefined" ? window.location.origin + "/callback" : ""
            }}
        >
            {children}
        </Auth0Provider>
    );
}
