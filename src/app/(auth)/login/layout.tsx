import type { Metadata } from "next";

const title = "Sign In";
const description =
    "Sign in to IVY LMS to access your IELTS courses, practice assignments, timed tests, and grading workspace.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: "/login"
    },
    openGraph: {
        title: `${title} | IVY LMS`,
        description,
        url: "/login"
    },
    twitter: {
        title: `${title} | IVY LMS`,
        description
    }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
