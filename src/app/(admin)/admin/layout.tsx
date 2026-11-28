import type { Metadata } from "next";
import { AdminLayoutShell } from "@/components/layout/portal-shells";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Admin Portal",
    description: "Manage IVY LMS teachers, IELTS courses, and class sessions.",
    robots: PRIVATE_ROBOTS
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
