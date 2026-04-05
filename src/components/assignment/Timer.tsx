"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { Clock } from "lucide-react";

interface TimerProps {
    className?: string;
}

export function Timer({ className }: TimerProps) {
    const { timeRemaining, isTimerRunning, tickTimer } = useAssignmentSessionStore();

    useEffect(() => {
        if (!isTimerRunning || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            tickTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, timeRemaining, tickTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isLowTime = timeRemaining <= 30 && timeRemaining > 0;
    const isTimeUp = timeRemaining <= 0;

    if (timeRemaining <= 0 && !isTimerRunning) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold",
                "bg-card border border-border shadow-sm",
                isLowTime && "bg-destructive/10 border-destructive text-destructive animate-pulse",
                isTimeUp && "text-destructive",
                className
            )}
        >
            <Clock className="size-5" />
            <span>{formatTime(Math.max(0, timeRemaining))}</span>
        </div>
    );
}
