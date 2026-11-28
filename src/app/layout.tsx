import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import {
    getSiteUrl,
    SITE_DESCRIPTION,
    SITE_KEYWORDS,
    SITE_NAME,
    SITE_TITLE_DEFAULT
} from "@/lib/seo";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});

export const metadata: Metadata = {
    metadataBase: getSiteUrl(),
    title: {
        default: SITE_TITLE_DEFAULT,
        template: `%s | ${SITE_NAME}`
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: SITE_KEYWORDS,
    authors: [{ name: "IVY IELTS" }],
    creator: "IVY IELTS",
    publisher: "IVY IELTS",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/IVY_IELTS_Logo.svg", type: "image/svg+xml" }
        ],
        apple: "/IVY_IELTS_Logo.svg"
    },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        locale: "en_US",
        url: "/",
        title: SITE_TITLE_DEFAULT,
        description: SITE_DESCRIPTION
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_TITLE_DEFAULT,
        description: SITE_DESCRIPTION
    },
    robots: {
        index: true,
        follow: true
    }
};

export const viewport: Viewport = {
    themeColor: "#a52222",
    width: "device-width",
    initialScale: 1
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" />
                </AuthProvider>
            </body>
        </html>
    );
}
