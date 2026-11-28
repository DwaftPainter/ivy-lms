import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getSiteUrl().origin;
    const now = new Date();

    return [
        {
            url: `${baseUrl}/login`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8
        },
        {
            url: `${baseUrl}/register`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8
        }
    ];
}
