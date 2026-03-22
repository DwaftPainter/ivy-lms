"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/course/course-card";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Loader2, BookCheck, BookOpen as BookOpenIcon, Calendar } from "lucide-react";
import { EnrollmentStatus } from "@/enums/erollment.enum";

const CoursesPage = () => {
    const { enrolledCourses, isLoading, fetchEnrolledCourses, getCoursesByStatus } = useEnrollmentStore();
    const [activeTab, setActiveTab] = useState<EnrollmentStatus>(EnrollmentStatus.STUDYING);

    useEffect(() => {
        fetchEnrolledCourses();
    }, [fetchEnrolledCourses]);

    const studyingCourses = getCoursesByStatus(EnrollmentStatus.STUDYING);
    console.log('🚀 ~ CoursesPage ~ studyingCourses:', studyingCourses)
    const upcomingCourses = getCoursesByStatus(EnrollmentStatus.UPCOMING);
    console.log('🚀 ~ CoursesPage ~ upcomingCourses:', upcomingCourses)
    const doneCourses = getCoursesByStatus(EnrollmentStatus.DONE);
    console.log('🚀 ~ CoursesPage ~ doneCourses:', doneCourses)

    const renderCourseGrid = (courses: typeof enrolledCourses, emptyMessage: string) => {
        if (courses.length === 0) {
            return (
                <div className="p-4 w-full">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mb-6" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{emptyMessage}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            You haven&apos;t enrolled in any courses yet. Browse available courses to get
                            started.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-4 w-full flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading your courses...</p>
                </div>
            </div>
        );
    }

    const isEmpty = enrolledCourses.length === 0;

    // if (isEmpty) {
    //     return (
    //         <div className="p-4 w-full">
    //             {/* Header */}
    //             <div className="mb-6">
    //                 <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
    //                 <p className="text-muted-foreground mt-1">
    //                     View and manage all your enrolled courses
    //                 </p>
    //             </div>

    //             <div className="flex flex-col items-center justify-center py-16 text-center">
    //                 <BookOpen className="w-16 h-16 text-muted-foreground mb-6" />
    //                 <h3 className="text-lg font-medium text-foreground mb-2">
    //                     No enrolled courses yet
    //                 </h3>
    //                 <p className="text-sm text-muted-foreground max-w-sm">
    //                     You haven&apos;t enrolled in any courses yet. Browse available courses to get started.
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="p-4 w-full">
            {/* Header
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage all your enrolled courses
                </p>
            </div> */}

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as EnrollmentStatus)}
                className="w-full"
            >
                <TabsList className="mb-6">
                    <TabsTrigger value={EnrollmentStatus.STUDYING} className="gap-2">
                        <BookOpenIcon className="w-4 h-4" />
                        Studying
                        {studyingCourses.length > 0 && (
                            <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {studyingCourses.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value={EnrollmentStatus.UPCOMING} className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Upcoming
                        {upcomingCourses.length > 0 && (
                            <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {upcomingCourses.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value={EnrollmentStatus.DONE} className="gap-2">
                        <BookCheck className="w-4 h-4" />
                        Done
                        {doneCourses.length > 0 && (
                            <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {doneCourses.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={EnrollmentStatus.STUDYING}>
                    {renderCourseGrid(studyingCourses, "No courses currently being studied")}
                </TabsContent>

                <TabsContent value={EnrollmentStatus.UPCOMING}>
                    {renderCourseGrid(upcomingCourses, "No upcoming courses")}
                </TabsContent>

                <TabsContent value={EnrollmentStatus.DONE}>
                    {renderCourseGrid(doneCourses, "No completed courses yet")}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CoursesPage;
