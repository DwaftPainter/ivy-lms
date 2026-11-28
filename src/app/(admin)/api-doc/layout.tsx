import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "API Documentation",
    robots: PRIVATE_ROBOTS
};

export default function ApiDocLayout({ children }: { children: React.ReactNode }) {
    return children;
}
