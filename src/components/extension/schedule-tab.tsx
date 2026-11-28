"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ScheduleLesson } from "@/store/schedule.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Dynamic import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react").then((mod) => mod.default), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading Calendar...</span>
            </div>
        </div>
    )
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
            return { bg: "#3b82f6", border: "#2563eb", light: "#dbeafe" }; // blue
        case "writing":
            return { bg: "#10b981", border: "#059669", light: "#d1fae5" }; // green
        case "reading":
            return { bg: "#f59e0b", border: "#d97706", light: "#fef3c7" }; // amber
        case "listening":
            return { bg: "#8b5cf6", border: "#7c3aed", light: "#ede9fe" }; // purple
        default:
            return { bg: "#6366f1", border: "#4f46e5", light: "#e0e7ff" }; // indigo
    }
}

export function ScheduleTab({ lessons }: ScheduleTabProps) {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [currentDate] = useState(new Date());
    const [viewType, setViewType] = useState<"month" | "week" | "day">("month");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    const calendarEvents = lessons.map((lesson) => {
        const skillLabel = lesson.type
            ? lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1).toLowerCase()
            : "";
        return {
            id: lesson.id,
            title: skillLabel
                ? `${skillLabel}: ${lesson.course} - ${lesson.title}`
                : `${lesson.course} - ${lesson.title}`,
            start: `${lesson.date}T${lesson.startTime}`,
            end: `${lesson.date}T${lesson.endTime}`,
            extendedProps: {
                type: lesson.type,
                skillLabel,
                instructor: lesson.instructor
            },
            backgroundColor: getEventColor(lesson.type).bg,
            borderColor: getEventColor(lesson.type).border
        };
    });

    const handleEventClick = (info: EventClickArg) => {
        router.push(`/lessons/${info.event.id}`);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Calendar */}
            <Card className="p-6 border rounded-3xl xl:col-span-4">
                {/* Custom Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Lesson Schedule
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {format(currentDate, "MMMM yyyy")} — {lessons.length} lessons scheduled
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center bg-muted rounded-lg p-1">
                            {(["month", "week", "day"] as const).map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setViewType(view)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        viewType === view
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/50 rounded-xl">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Lesson Types:
                    </span>
                    {[
                        { label: "Speaking", color: "bg-blue-500" },
                        { label: "Writing", color: "bg-emerald-500" },
                        { label: "Reading", color: "bg-amber-500" },
                        { label: "Listening", color: "bg-purple-500" }
                    ].map((item) => (
                        <span
                            key={item.label}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground"
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                            {item.label}
                        </span>
                    ))}
                </div>

                {/* Calendar */}
                <div className="h-[650px] fc-custom">
                    {isClient && (
                        <FullCalendar
                            key={viewType}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, scrollGridPlugin]}
                            initialView={
                                viewType === "month"
                                    ? "dayGridMonth"
                                    : viewType === "week"
                                      ? "timeGridWeek"
                                      : "timeGridDay"
                            }
                            headerToolbar={false}
                            events={calendarEvents}
                            height="100%"
                            editable={false}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEventRows={4}
                            weekends={true}
                            eventDisplay="block"
                            eventTimeFormat={{
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false
                            }}
                            slotMinTime="07:00:00"
                            slotMaxTime="22:00:00"
                            eventClick={handleEventClick}
                            eventClassNames="rounded-lg border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-xs font-medium"
                            dayHeaderClassNames="text-sm font-semibold text-muted-foreground py-2"
                            slotLabelClassNames="text-xs text-muted-foreground"
                            allDayClassNames="text-sm font-medium"
                            dayMinWidth={120}
                        />
                    )}
                </div>
            </Card>

            {/* Sidebar - Upcoming Lessons */}
            {/* <Card className="p-5 shadow-none border rounded-[16px] xl:col-span-1 h-fit">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Upcoming Lessons
                </h3>

                <div className="space-y-3">
                    {upcomingLessons.length === 0 ? (
                        <div className="text-center py-8">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No upcoming lessons</p>
                        </div>
                    ) : (
                        upcomingLessons.map((lesson, idx) => {
                            const lessonDate = new Date(`${lesson.date}T${lesson.startTime}`);
                            const typeConfig = getLessonTypeIcon(lesson.type);
                            const colors = getEventColor(lesson.type);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => router.push(`/lessons/${lesson.id}`)}
                                    className="group p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex flex-col items-center justify-center text-center shrink-0"
                                            style={{ backgroundColor: colors.light }}
                                        >
                                            <span
                                                className="text-xs font-medium"
                                                style={{ color: colors.border }}
                                            >
                                                {format(lessonDate, "MMM")}
                                            </span>
                                            <span
                                                className="text-lg font-bold leading-none"
                                                style={{ color: colors.border }}
                                            >
                                                {format(lessonDate, "d")}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-0.5 truncate">
                                                {lesson.course}
                                            </p>
                                            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                {lesson.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span
                                                    className={`text-xs ${typeConfig.color} flex items-center gap-1`}
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ backgroundColor: colors.bg }}
                                                    />
                                                    {lesson.type}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {lesson.startTime.slice(0, 5)} -{" "}
                                                    {lesson.endTime.slice(0, 5)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {upcomingLessons.length > 0 && (
                    <Button
                        variant="ghost"
                        className="w-full mt-4 text-sm"
                        onClick={() => router.push("/extension?tab=schedule")}
                    >
                        View Full Schedule
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </Card> */}
        </div>
    );
}
