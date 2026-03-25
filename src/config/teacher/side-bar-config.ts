import { LayoutGridIcon, SettingsIcon, MessageSquareIcon } from "lucide-react";

export const teacherSidebarNavConfig = [
    { title: "Dashboard", url: "/teacher", icon: LayoutGridIcon, isActive: true },
    { title: "Messages", url: "/teacher/messages", icon: MessageSquareIcon },
    { title: "Settings", url: "/teacher/settings", icon: SettingsIcon }
];
