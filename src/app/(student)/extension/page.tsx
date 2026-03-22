"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useScheduleStore } from "@/store/schedule.store";
import { useClassStore } from "@/store/class.store";
import { useAssignmentStore } from "@/store/assignment.store";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, ClipboardList, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { SubmissionStatus } from "@/generated/prisma/enums";

// Dynamic import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(
    () => import("@fullcalendar/react").then((mod) => mod.default),
    { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center">Loading Calendar...</div> }
);

// Import FullCalendar plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const ExtensionPage = () => {
    const [activeTab, setActiveTab] = useState("schedule");
    const { lessons, isLoading: scheduleLoading, fetchSchedule } = useScheduleStore();
    const { classes, fetchClasses } = useClassStore();
    const { assignments, isLoading: assignmentsLoading, fetchAssignments } = useAssignmentStore();
    const { enrolledCourses, fetchEnrolledCourses } = useEnrollmentStore();

    useEffect(() => {
        fetchSchedule();
        fetchClasses();
        fetchAssignments();
        fetchEnrolledCourses();
    }, [fetchSchedule, fetchClasses, fetchAssignments, fetchEnrolledCourses]);

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

    const getStatusIcon = (status: SubmissionStatus) => {
        switch (status) {
            case SubmissionStatus.SUBMITTED:
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case SubmissionStatus.GRADED:
            case SubmissionStatus.RETURNED:
                return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-amber-500" />;
        }
    };

    const getStatusText = (status: SubmissionStatus) => {
        switch (status) {
            case SubmissionStatus.SUBMITTED:
                return { text: "Submitted", class: "bg-emerald-100 text-emerald-700" };
            case SubmissionStatus.GRADED:
                return { text: "Graded", class: "bg-blue-100 text-blue-700" };
            case SubmissionStatus.RETURNED:
                return { text: "Returned", class: "bg-purple-100 text-purple-700" };
            default:
                return { text: "Pending", class: "bg-amber-100 text-amber-700" };
        }
    };

    const formatDueDate = (date: Date | null) => {
        if (!date) return "No due date";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const isLoading = scheduleLoading || assignmentsLoading;

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

    // Group assignments by course
    const assignmentsByCourse = enrolledCourses.map((course) => ({
        ...course,
        assignments: assignments.filter(a => a.course.id === course.id)
    }));

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
                    <TabsTrigger value="progress" className="gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Progress
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
                                            <span>{cls.date} ({cls.day})</span>
                                            <span>{cls.time}</span>
                                            <span>{cls.instructor}</span>
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
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">All Assignments</h2>
                            <div className="text-sm text-muted-foreground">
                                Total: {assignments.length} | Pending: {assignments.filter(a => a.submissionStatus === SubmissionStatus.PENDING).length}
                            </div>
                        </div>

                        {/* Group by course */}
                        {assignmentsByCourse.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No assignments available
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {assignmentsByCourse.map((course) => (
                                    <div key={course.id} className="border border-border/50 rounded-lg overflow-hidden">
                                        <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
                                            <h3 className="font-semibold text-foreground">{course.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                <span>Status: {course.status}</span>
                                                <span>Progress: {course.progress?.completionPercentage || 0}%</span>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-border/50">
                                            {course.assignments.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm">
                                                    No assignments for this course
                                                </div>
                                            ) : (
                                                course.assignments.map((assignment) => {
                                                    const statusStyle = getStatusText(assignment.submissionStatus);
                                                    return (
                                                        <div
                                                            key={assignment.id}
                                                            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium text-foreground">{assignment.title}</h4>
                                                                    {assignment.isOverdue && assignment.submissionStatus === SubmissionStatus.PENDING && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Overdue</span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                                        {assignment.skill}
                                                                    </span>
                                                                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                                                                        {assignment.type}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    Due: {formatDueDate(assignment.dueDate)}
                                                                </p>
                                                            </div>

                                                            <div className="text-right space-y-2">
                                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusStyle.class}`}>
                                                                    {getStatusIcon(assignment.submissionStatus)}
                                                                    {statusStyle.text}
                                                                </span>
                                                                {assignment.submission?.score && (
                                                                    <p className="text-sm font-medium">
                                                                        Score: {assignment.submission.score}/{assignment.maxScore}
                                                                    </p>
                                                                )}
                                                                {assignment.submissionStatus === SubmissionStatus.PENDING && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => window.location.href = `/student/assignments/${assignment.id}`}
                                                                    >
                                                                        Start
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress">
                    <Card className="p-6 shadow-none border rounded-[12px]">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Course Progress</h2>
                        {enrolledCourses.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No enrolled courses
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {enrolledCourses.map((course) => {
                                    const progress = course.progress?.completionPercentage || 0;
                                    return (
                                        <div key={course.id} className="border border-border/50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-foreground">{course.title}</h3>
                                                <span className={`text-sm px-2 py-1 rounded ${
                                                    course.status === "STUDYING" ? "bg-emerald-100 text-emerald-700" :
                                                    course.status === "DONE" ? "bg-blue-100 text-blue-700" :
                                                    "bg-amber-100 text-amber-700"
                                                }`}>
                                                    {course.status}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                                    <span>Overall Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Assignments</p>
                                                    <p className="font-medium">
                                                        {course.progress?.completedAssignments || 0} / {course.progress?.totalAssignments || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Lessons</p>
                                                    <p className="font-medium">
                                                        {course.progress?.completedSessions || 0} / {course.progress?.totalSessions || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
