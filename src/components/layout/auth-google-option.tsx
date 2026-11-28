import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
import googleIcon from "@/assets/icons/google.svg";
import { Button } from "@/components/ui/button";

export function AuthGoogleOption() {
    const { loginWithRedirect } = useAuth0();

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full"
                onClick={() =>
                    loginWithRedirect({
                        authorizationParams: { connection: "google-oauth2" }
                    })
                }
            >
                <Image src={googleIcon.src} alt="" width={18} height={18} />
                Continue with Google
            </Button>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                or
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
        </>
    );
}
