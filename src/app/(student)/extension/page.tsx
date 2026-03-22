"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useScheduleStore } from "@/store/schedule.store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Calendar, BookOpen, ClipboardList, FileText, Loader2 } from "lucide-react";

// Dynamic import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(
    () => import("@fullcalendar/react").then((mod) => mod.default),
    { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center">Loading Calendar...</div> }
);

// Import FullCalendar plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useClassStore } from "@/store/class.store";
import { useAssignmentStore } from "@/store/assignment.store";

const ExtensionPage = () => {
    const [activeTab, setActiveTab] = useState("schedule");
    const { lessons, isLoading: scheduleLoading, fetchSchedule } = useScheduleStore();
    const { classes, fetchClasses } = useClassStore();
    const { assignments, fetchAssignments } = useAssignmentStore();

    useEffect(() => {
        fetchSchedule();
        fetchClasses();
        fetchAssignments();
    }, [fetchSchedule, fetchClasses, fetchAssignments]);

    // Convert lessons to FullCalendar events
    const calendarEvents = lessons.map((lesson) => ({
        id: lesson.id,
        title: `${lesson.course} - ${lesson.title}`,
        start: `${lesson.date}T${lesson.startTime}`,
        end: `${lesson.date}T${lesson.endTime}`,
        extendedProps: {
            type: lesson.type,
            instructor: lesson.instructor,
        },
            backgroundColor: getEventColor(lesson.type),
        borderColor: getEventColor(lesson.type),
    }));

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
            case "grammar":
                return "#ec4899"; // pink
            default:
                return "#6366f1"; // indigo
        }
    }

    const handleEventClick = (info: any) => {
        alert(`Lesson: ${info.event.title}\nType: ${info.event.extendedProps.type}\nInstructor: ${info.event.extendedProps.instructor}`);
    };

    const isLoading = scheduleLoading;

    if (isLoading) {
        return (
            <div className="p-4 w-full flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading extension...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Extension</h1>
                <p className="text-muted-foreground mt-1">
                    Access your schedule, classes, assignments, and materials
                </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="schedule" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule
                    </TabsTrigger>
                    <TabsTrigger value="classes" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        Classes
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="material" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Material
                    </TabsTrigger>
                </TabsList>

                {/* Schedule Tab with FullCalendar */}
                <TabsContent value="schedule">
                    <Card className="p-6 shadow-none border rounded-[12px]">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Lesson Schedule
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    View your upcoming lessons and events
                                </p>
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
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <span className="w-3 h-3 rounded-full bg-pink-500"></span> Grammar
                                </span>
                            </div>
                        </div>

                        <div className="h-[600px]">
                            {typeof window !== "undefined" && (
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    events={calendarEvents}
                                    eventClick={handleEventClick}
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
                                        hour12: false,
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* Classes Tab */}
                <TabsContent value="classes">
                    <Card className="p-6 shadow-none border rounded-[12px]">
                        <h2 className="text-lg font-semibold text-foreground mb-6">All Classes</h2>
                        {classes.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No classes available
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {classes.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="p-4 bg-secondary rounded-lg border border-border/50"
                                    >
                                        <h3 className="font-semibold text-foreground">{cls.title}</h3>
                                        <p className="text-sm text-muted-foreground">{cls.course}</p>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>📅 {cls.date} ({cls.day})</span>
                                            <span>🕐 {cls.time}</span>
                                            <span>👤 {cls.instructor}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments">
                    <Card className="p-6 shadow-none border rounded-[12px]">
                        <h2 className="text-lg font-semibold text-foreground mb-6">All Assignments</h2>
                        {assignments.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No assignments available
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="p-4 bg-secondary rounded-lg border border-border/50 flex justify-between items-center"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                                            <p className="text-sm text-muted-foreground">{assignment.course}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {assignment.skill}
                                                </span>
                                                <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                                                    {assignment.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground">
                                                Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No due date"}
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                assignment.status === "SUBMITTED"
                                                    ? "bg-green-100 text-green-700"
                                                    : assignment.status === "GRADED"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Material Tab */}
                <TabsContent value="material">
                    <Card className="p-6 shadow-none border rounded-[12px]">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Course Materials</h2>
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p>Materials will be available here</p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ExtensionPage;
