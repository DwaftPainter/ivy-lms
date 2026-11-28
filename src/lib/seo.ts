import type { Metadata } from "next";

export const SITE_NAME = "IVY LMS";
export const SITE_TITLE_DEFAULT = "IVY LMS — IELTS Learning & Assessment Platform";
export const SITE_DESCRIPTION =
    "IVY LMS is an IELTS learning management system for students, teachers, and administrators with interactive Reading, Listening, Writing, and Speaking practice, timed mock exams, AI-assisted feedback, and rubric grading.";

export const SITE_KEYWORDS = [
    "IVY LMS",
    "IVY IELTS",
    "IELTS preparation",
    "IELTS learning management system",
    "IELTS mock test",
    "IELTS Reading practice",
    "IELTS Listening practice",
    "IELTS Writing feedback",
    "IELTS Speaking practice"
];

export const PRIVATE_ROBOTS: NonNullable<Metadata["robots"]> = {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
        index: false,
        follow: false
    }
};

export function getSiteUrl(): URL {
    const raw =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    try {
        return new URL(raw);
    } catch {
        return new URL("http://localhost:3000");
    }
}
