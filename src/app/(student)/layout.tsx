import type { Metadata } from "next";
import { StudentLayoutShell } from "@/components/layout/portal-shells";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Student Portal",
    description:
        "View your IELTS study plan, enrolled courses, schedule, and lesson resources on IVY LMS.",
    robots: PRIVATE_ROBOTS
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <StudentLayoutShell>{children}</StudentLayoutShell>;
}
