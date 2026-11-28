import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Signing In",
    robots: PRIVATE_ROBOTS
};

export default function CallbackLayout({ children }: { children: React.ReactNode }) {
    return children;
}
