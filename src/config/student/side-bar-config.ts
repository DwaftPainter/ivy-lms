import { BlocksIcon, BookIcon, LayoutGridIcon, SettingsIcon } from "lucide-react";

export const sidebarNavConfig = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutGridIcon, isActive: true },
    { title: "Courses", url: "/courses", icon: BookIcon },
    { title: "Extension", url: "/extension", icon: BlocksIcon },
    { title: "Settings", url: "#", icon: SettingsIcon }
];
