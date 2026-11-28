import type { Metadata } from "next";
import { AssignmentExamLayoutShell } from "@/components/layout/portal-shells";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "IELTS Practice & Assessment",
    description: "Complete your timed IELTS practice or graded assignment in IVY LMS.",
    robots: PRIVATE_ROBOTS
};

export default function AssignmentLayout({ children }: { children: React.ReactNode }) {
    return <AssignmentExamLayoutShell>{children}</AssignmentExamLayoutShell>;
}
