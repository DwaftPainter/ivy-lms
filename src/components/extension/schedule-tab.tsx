"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ScheduleLesson } from "@/store/schedule.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Dynamic import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react").then((mod) => mod.default), {
    ssr: false,
    loading: () => <div className="h-[500px] flex items-center justify-center">Loading Calendar...</div>
});

interface ScheduleTabProps {
    lessons: ScheduleLesson[];
}

interface EventClickArg {
    event: {
        id: string;
        title: string;
        extendedProps: Record<string, unknown>;
    };
}

function getEventColor(type: string) {
    switch (type.toLowerCase()) {
        case "speaking":
            return "#3b82f6"; // blue
        case "writing":
            return "#10b981"; // green
        case "reading":
            return "#f59e0b"; // amber
        case "listening":
            return "#8b5cf6"; // purple
        default:
            return "#6366f1"; // indigo
    }
}

export function ScheduleTab({ lessons }: ScheduleTabProps) {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    const calendarEvents = lessons.map((lesson) => ({
        id: lesson.id,
        title: `${lesson.course} - ${lesson.title}`,
        start: `${lesson.date}T${lesson.startTime}`,
        end: `${lesson.date}T${lesson.endTime}`,
        extendedProps: {
            type: lesson.type,
            instructor: lesson.instructor
        },
        backgroundColor: getEventColor(lesson.type),
        borderColor: getEventColor(lesson.type)
    }));

    const handleEventClick = (info: EventClickArg) => {
        router.push(`/lessons/${info.event.id}`);
    };

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Lesson Schedule</h2>
                    <p className="text-sm text-muted-foreground">View your upcoming lessons and events</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span> Speaking
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Writing
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span> Reading
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span> Listening
                    </span>
                </div>
            </div>

            <div className="h-150">
                {isClient && (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay"
                        }}
                        events={calendarEvents}
                        height="100%"
                        editable={false}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        eventDisplay="block"
                        eventTimeFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                        }}
                        eventClick={handleEventClick}
                        eventClassNames="cursor-pointer hover:opacity-90"
                    />
                )}
            </div>
        </Card>
    );
}
