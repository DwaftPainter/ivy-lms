import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: {
            userAgent: "*",
            allow: ["/login", "/register"],
            disallow: [
                "/api/",
                "/admin/",
                "/teacher/",
                "/dashboard/",
                "/courses/",
                "/extension/",
                "/lessons/",
                "/settings/",
                "/assignments/",
                "/callback",
                "/api-doc"
            ]
        },
        sitemap: `${siteUrl.origin}/sitemap.xml`
    };
}
