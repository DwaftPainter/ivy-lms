"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ClipboardCheck,
    Clock,
    AlertCircle,
    BookOpen,
    Users,
    GraduationCap,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    BarChart3
} from "lucide-react";
import { IeltsSkill } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface GradingAssignment {
    assignmentId: string;
    title: string;
    courseName: string;
    courseId: string;
    sessionTitle: string;
    pendingCount: number;
    deadline: string | null;
    skill: IeltsSkill;
}

interface GradingStats {
    totalCourses: number;
    totalStudents: number;
    totalSubmissionsToGrade: number;
    upcomingClassesCount: number;
}

interface DashboardData {
    greeting: string;
    pendingGrading: GradingAssignment[];
    summary: GradingStats;
}

const skillLabels: Record<string, string> = {
    READING: "Reading",
    LISTENING: "Listening",
    WRITING: "Writing",
    SPEAKING: "Speaking"
};

const skillColors: Record<string, string> = {
    READING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    LISTENING: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    WRITING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    SPEAKING: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
};

const skillIcons: Record<string, React.ReactNode> = {
    READING: <BookOpen className="w-4 h-4" />,
    LISTENING: <BarChart3 className="w-4 h-4" />,
    WRITING: <GraduationCap className="w-4 h-4" />,
    SPEAKING: <Users className="w-4 h-4" />
};

export default function TeacherGradingOverviewPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    useEffect(() => {
        fetchGradingData();
    }, []);

    const fetchGradingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ success: boolean; data: DashboardData }>(
                "/api/teacher/dashboard"
            );
            setData(response.data);
        } catch (err) {
            setError(getErrorMessage(err) || "Failed to fetch grading data");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssignments = data?.pendingGrading.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSkill = selectedSkill ? assignment.skill === selectedSkill : true;
        return matchesSearch && matchesSkill;
    }) || [];

    const stats = data?.summary;

    const handleGradeClick = (assignmentId: string) => {
        router.push(`/teacher/assignments/${assignmentId}/grade`);
    };

    if (isLoading) {
        return (
            <div className="h-full p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Grading Center</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data?.greeting} - You have {stats?.totalSubmissionsToGrade || 0} submissions awaiting review
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchGradingData}>
                        <Clock className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6 max-w-7xl mx-auto">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending Grading</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {stats?.totalSubmissionsToGrade || 0}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <ClipboardCheck className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Active Courses</p>
                                        <p className="text-3xl font-bold mt-1">{stats?.totalCourses || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Students</p>
                                        <p className="text-3xl font-bold mt-1">{stats?.totalStudents || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Upcoming Classes</p>
                                        <p className="text-3xl font-bold mt-1">
                                            {stats?.upcomingClassesCount || 0}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Assignments Awaiting Grading */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ClipboardCheck className="w-5 h-5" />
                                        Assignments Awaiting Grading
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {filteredAssignments.length} assignment
                                        {filteredAssignments.length !== 1 ? "s" : ""} need attention
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search assignments..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 w-64"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skill Filter */}
                            <div className="flex items-center gap-2 mt-4">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Filter by skill:</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant={selectedSkill === null ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSkill(null)}
                                    >
                                        All
                                    </Button>
                                    {(Object.keys(IeltsSkill) as string[]).map((skill) => (
                                        <Button
                                            key={skill}
                                            variant={selectedSkill === skill ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedSkill(skill)}
                                            className={cn(
                                                selectedSkill === skill && skillColors[skill]
                                            )}
                                        >
                                            {skillIcons[skill]}
                                            <span className="ml-1">{skillLabels[skill]}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {filteredAssignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">All caught up!</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchQuery || selectedSkill
                                            ? "No assignments match your filters."
                                            : "No submissions awaiting your review."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAssignments.map((assignment) => (
                                        <div
                                            key={assignment.assignmentId}
                                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "font-medium",
                                                            skillColors[assignment.skill]
                                                        )}
                                                    >
                                                        {skillIcons[assignment.skill]}
                                                        <span className="ml-1">
                                                            {skillLabels[assignment.skill]}
                                                        </span>
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {assignment.courseName}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold truncate">
                                                    {assignment.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Session: {assignment.sessionTitle}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-sm text-amber-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="font-medium">
                                                            {assignment.pendingCount} pending
                                                        </span>
                                                    </div>
                                                    {assignment.deadline && (
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span>
                                                                Due{" "}
                                                                {format(
                                                                    new Date(assignment.deadline),
                                                                    "MMM d, yyyy"
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleGradeClick(assignment.assignmentId)}
                                                className="ml-4 shrink-0"
                                            >
                                                Grade Now
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}
