"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { Clock } from "lucide-react";

interface WritingTimerProps {
    className?: string;
    isSubmitted?: boolean;
}

export function WritingTimer({ className, isSubmitted }: WritingTimerProps) {
    const { elapsedTime, isTrackingTime, tickElapsedTime, startTimeTracking } = useAssignmentSessionStore();

    useEffect(() => {
        if (!isTrackingTime || isSubmitted) return;

        const interval = setInterval(() => {
            tickElapsedTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTrackingTime, isSubmitted, tickElapsedTime]);

    // Auto-start tracking when component mounts and not submitted
    useEffect(() => {
        if (!isSubmitted && !isTrackingTime) {
            startTimeTracking();
        }
    }, [isSubmitted, isTrackingTime, startTimeTracking]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold",
                "bg-card border border-border shadow-sm",
                isSubmitted && "opacity-70",
                className
            )}
        >
            <Clock className="size-5 text-primary" />
            <span>{formatTime(elapsedTime)}</span>
        </div>
    );
}
