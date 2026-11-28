"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useScheduleStore } from "@/store/schedule.store";
import { useClassStore } from "@/store/class.store";
import { useAssignmentStore } from "@/store/assignment.store";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, BookOpen, ClipboardList } from "lucide-react";
import { ScheduleTab } from "@/components/extension/schedule-tab";
import { ClassesTab } from "@/components/extension/classes-tab";
import { AssignmentsTab } from "@/components/extension/assignments-tab";
import Loader from "@/components/custom-ui/loader";

const ExtensionPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabFromUrl = searchParams.get("tab") || "schedule";
    const [activeTab, setActiveTab] = useState(tabFromUrl);
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

    useEffect(() => {
        setActiveTab(tabFromUrl);
    }, [tabFromUrl]);

    const isLoading = scheduleLoading || assignmentsLoading;

    if (isLoading) {
        return (
            <div className="mx-auto flex size-full w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-4">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Extension
                </h1>
                <p className="mt-1.5 text-sm text-text-primary sm:text-base">
                    Browse your schedule, upcoming classes, and coursework.
                </p>
            </header>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(value) => {
                    setActiveTab(value);

                    const params = new URLSearchParams(searchParams.toString());
                    params.set("tab", value);

                    router.push(`/extension?${params.toString()}`);
                }}
            >
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
                    {/* <TabsTrigger value="progress" className="gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Progress
                    </TabsTrigger> */}
                </TabsList>

                <TabsContent value="schedule">
                    <ScheduleTab lessons={lessons} />
                </TabsContent>

                <TabsContent value="classes">
                    <ClassesTab classes={classes} />
                </TabsContent>

                <TabsContent value="assignments">
                    <AssignmentsTab assignments={assignments} enrolledCourses={enrolledCourses} />
                </TabsContent>

                {/* <TabsContent value="progress">
                    <ProgressTab enrolledCourses={enrolledCourses} />
                </TabsContent> */}
            </Tabs>
        </div>
    );
};

export default ExtensionPage;
