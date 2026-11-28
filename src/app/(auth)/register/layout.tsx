import type { Metadata } from "next";

const title = "Create Account";
const description =
    "Create an IVY LMS student account to join IELTS courses, practise all four skills, and receive AI and instructor feedback.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: "/register"
    },
    openGraph: {
        title: `${title} | IVY LMS`,
        description,
        url: "/register"
    },
    twitter: {
        title: `${title} | IVY LMS`,
        description
    }
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return children;
}
