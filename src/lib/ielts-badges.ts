import { IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const IELTS_SKILL_LABELS: Record<IeltsSkill, string> = {
    [IeltsSkill.LISTENING]: "Listening",
    [IeltsSkill.READING]: "Reading",
    [IeltsSkill.WRITING]: "Writing",
    [IeltsSkill.SPEAKING]: "Speaking"
};

export function getSkillLabel(skill: IeltsSkill | string): string {
    return IELTS_SKILL_LABELS[skill as IeltsSkill] ?? String(skill);
}

export function getStudentSubmissionStatusBadge(status: SubmissionStatus): {
    label: string;
    variant: BadgeVariant;
} {
    switch (status) {
        case SubmissionStatus.SUBMITTED:
            return { label: "Submitted", variant: "secondary" };
        case SubmissionStatus.GRADED:
            return { label: "Graded", variant: "secondary" };
        case SubmissionStatus.RETURNED:
            return { label: "Returned", variant: "secondary" };
        case SubmissionStatus.PENDING:
        default:
            return { label: "Not Started", variant: "outline" };
    }
}

export function getTeacherSubmissionStatusBadge(status: SubmissionStatus): {
    label: string;
    variant: BadgeVariant;
} {
    switch (status) {
        case SubmissionStatus.GRADED:
        case SubmissionStatus.RETURNED:
            return { label: "Graded", variant: "secondary" };
        case SubmissionStatus.SUBMITTED:
            return { label: "Pending review", variant: "outline" };
        case SubmissionStatus.PENDING:
        default:
            return { label: "Draft", variant: "outline" };
    }
}
