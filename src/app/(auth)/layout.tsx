import { AuthLayoutShell } from "@/components/layout/portal-shells";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

const siteUrl = getSiteUrl().origin;

const webAppStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    provider: {
        "@type": "EducationalOrganization",
        name: "IVY IELTS",
        url: siteUrl
    }
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webAppStructuredData).replace(/</g, "\\u003c")
                }}
            />
            <AuthLayoutShell>{children}</AuthLayoutShell>
        </>
    );
}
