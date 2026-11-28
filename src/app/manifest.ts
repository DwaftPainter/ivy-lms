import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "IVY LMS — IELTS Learning & Assessment Platform",
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#a52222",
        icons: [
            {
                src: "/IVY_IELTS_Logo.svg",
                sizes: "any",
                type: "image/svg+xml"
            },
            {
                src: "/favicon.ico",
                sizes: "48x48",
                type: "image/x-icon"
            }
        ]
    };
}
