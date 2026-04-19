import { BlocksIcon, BookIcon, LayoutGridIcon, SettingsIcon, ClipboardListIcon } from "lucide-react";

export const sidebarNavConfig = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutGridIcon },
    { title: "Courses", url: "/courses", icon: BookIcon },
    { title: "Assignments", url: "/assignments", icon: ClipboardListIcon },
    { title: "Extension", url: "/extension", icon: BlocksIcon },
    { title: "Settings", url: "/settings", icon: SettingsIcon }
];
