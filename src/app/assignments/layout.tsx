import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Assignments",
    description:
        "Browse and complete your IELTS Reading, Listening, Writing, and Speaking assignments on IVY LMS.",
    robots: PRIVATE_ROBOTS
};

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
