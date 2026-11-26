import { IeltsSkill } from "@/generated/prisma/enums";
import { FileText, Headphones, Link as LinkIcon, Video } from "lucide-react";

export const LESSON_SKILL_LABELS: Record<IeltsSkill, string> = {
    [IeltsSkill.LISTENING]: "Listening",
    [IeltsSkill.READING]: "Reading",
    [IeltsSkill.WRITING]: "Writing",
    [IeltsSkill.SPEAKING]: "Speaking"
};

export const LESSON_SKILL_COLORS: Record<IeltsSkill, string> = {
    [IeltsSkill.LISTENING]: "bg-blue-100 text-blue-700 border-blue-200",
    [IeltsSkill.READING]: "bg-green-100 text-green-700 border-green-200",
    [IeltsSkill.WRITING]: "bg-amber-100 text-amber-700 border-amber-200",
    [IeltsSkill.SPEAKING]: "bg-purple-100 text-purple-700 border-purple-200"
};

export const ASSIGNMENT_TYPE_LABELS: Record<string, string> = {
    WRITING_TASK1: "Writing Task 1",
    WRITING_TASK2: "Writing Task 2",
    SPEAKING: "Speaking",
    LISTENING: "Listening",
    READING: "Reading",
    MOCK_TEST: "Mock Test"
};

export function getMaterialFileIcon(fileType: string) {
    const type = fileType.toUpperCase();
    switch (type) {
        case "VIDEO":
            return <Video className="w-5 h-5 text-blue-500" />;
        case "AUDIO":
            return <Headphones className="w-5 h-5 text-purple-500" />;
        case "LINK":
            return <LinkIcon className="w-5 h-5 text-green-500" />;
        case "PDF":
        default:
            return <FileText className="w-5 h-5 text-red-500" />;
    }
}

export function formatLessonTime(timeString: string): string {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

export function formatLessonDate(dateString: string): string {
    const date = new Date(dateString);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatAssignmentDueDate(dateString: string | null): string {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
