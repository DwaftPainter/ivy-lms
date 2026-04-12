/**
 * Session status types based on scheduled time
 */
export type SessionStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

/**
 * Gets the current status of a session based on its scheduled date and time
 * @param scheduledDate - The scheduled date of the session
 * @param startTime - The start time in HH:mm format
 * @param endTime - The end time in HH:mm format
 * @returns The session status: UPCOMING, ONGOING, or COMPLETED
 */
export function getSessionStatus(
    scheduledDate: Date | string,
    startTime: string,
    endTime: string
): SessionStatus {
    const now = new Date();
    const sessionDate = new Date(scheduledDate);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, startMinute, 0, 0);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour, endMinute, 0, 0);

    if (now < sessionStart) {
        return "UPCOMING";
    } else if (now >= sessionStart && now <= sessionEnd) {
        return "ONGOING";
    } else {
        return "COMPLETED";
    }
}

/**
 * Checks if students should have access to a session based on its status
 * @param status - The session status
 * @param allowAccessBeforeStart - Whether to allow access before session starts (preview mode)
 * @returns boolean indicating if access should be granted
 */
export function canAccessSession(
    status: SessionStatus,
    allowAccessBeforeStart: boolean = false
): boolean {
    if (allowAccessBeforeStart) {
        return true;
    }
    return status === "ONGOING" || status === "COMPLETED";
}

/**
 * Configuration for access control based on session status
 */
export interface AccessControlConfig {
    allowUpcoming: boolean;
    allowOngoing: boolean;
    allowCompleted: boolean;
}

/**
 * Default access control configuration
 * - Teachers can access all sessions
 * - Students can access ongoing and completed sessions
 */
export const defaultAccessControl: AccessControlConfig = {
    allowUpcoming: false,
    allowOngoing: true,
    allowCompleted: true
};

/**
 * Checks if access should be granted based on status and configuration
 * @param status - The session status
 * @param config - The access control configuration
 * @returns boolean indicating if access should be granted
 */
export function checkAccessByStatus(
    status: SessionStatus,
    config: AccessControlConfig = defaultAccessControl
): boolean {
    switch (status) {
        case "UPCOMING":
            return config.allowUpcoming;
        case "ONGOING":
            return config.allowOngoing;
        case "COMPLETED":
            return config.allowCompleted;
        default:
            return false;
    }
}

/**
 * Gets a human-readable label for the session status
 * @param status - The session status
 * @returns Human-readable label
 */
export function getSessionStatusLabel(status: SessionStatus): string {
    const labels: Record<SessionStatus, string> = {
        UPCOMING: "Upcoming",
        ONGOING: "Ongoing",
        COMPLETED: "Completed"
    };
    return labels[status];
}

/**
 * Gets CSS classes for styling the status badge
 * @param status - The session status
 * @returns CSS class string
 */
export function getSessionStatusColor(status: SessionStatus): string {
    const colors: Record<SessionStatus, string> = {
        UPCOMING: "bg-slate-100 text-slate-700 border-slate-200",
        ONGOING: "bg-emerald-100 text-emerald-700 border-emerald-200",
        COMPLETED: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status];
}
