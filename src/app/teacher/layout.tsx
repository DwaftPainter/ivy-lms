import type { Metadata } from "next";
import { TeacherLayoutShell } from "@/components/layout/portal-shells";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Teacher Portal",
    description:
        "Manage IELTS class sessions, build assignments, and grade student submissions on IVY LMS.",
    robots: PRIVATE_ROBOTS
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <TeacherLayoutShell>{children}</TeacherLayoutShell>;
}
