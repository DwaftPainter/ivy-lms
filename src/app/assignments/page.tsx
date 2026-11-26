"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    Filter,
    ArrowRight,
    BookOpen,
    GraduationCap
} from "lucide-react";
import { IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";
import { format } from "date-fns";
import {
    IELTS_SKILL_LABELS,
    getSkillLabel,
    getStudentSubmissionStatusBadge
} from "@/lib/ielts-badges";

interface AssignmentSummary {
    id: string;
    title: string;
    description?: string;
    type: string;
    skill: IeltsSkill;
    dueDate?: string;
    maxScore: number;
    course?: {
        id: string;
        title: string;
    };
    classSession?: {
        id: string;
        title: string;
    };
    isOverdue: boolean;
    submissionStatus: SubmissionStatus;
    submission?: {
        id: string;
        status: SubmissionStatus;
        submittedAt?: string;
        gradedAt?: string;
        score?: number;
        bandScore?: number;
    };
}

interface AssignmentsData {
    assignments: AssignmentSummary[];
    summary: {
        total: number;
        pending: number;
        submitted: number;
        graded: number;
    };
}

const skillLabels = IELTS_SKILL_LABELS;

export default function StudentAssignmentsPage() {
    const router = useRouter();
    const [data, setData] = useState<AssignmentsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [skillFilter, setSkillFilter] = useState<string>("all");

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{
                success: boolean;
                data: AssignmentsData;
            }>("/api/student/assignments");
            setData(response.data);
        } catch (err) {
            setError(getErrorMessage(err) || "Failed to fetch assignments");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssignments =
        data?.assignments.filter((assignment) => {
            const matchesSearch =
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.course?.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === "all" || assignment.submissionStatus === statusFilter;
            const matchesSkill =
                skillFilter === "all" || assignment.skill === skillFilter;
            return matchesSearch && matchesStatus && matchesSkill;
        }) || [];

    const handleStartAssignment = (assignmentId: string) => {
        router.push(`/assignments/${assignmentId}`);
    };

    if (isLoading) {
        return (
            <div className="h-full p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24" />
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
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const summary = data?.summary;

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Assignments</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            View and complete your course assignments
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-3xl font-bold mt-1">{summary?.total || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-3xl font-bold mt-1 text-amber-600">
                                            {summary?.pending || 0}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted</p>
                                        <p className="text-3xl font-bold mt-1 text-blue-600">
                                            {summary?.submitted || 0}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Graded</p>
                                        <p className="text-3xl font-bold mt-1 text-green-600">
                                            {summary?.graded || 0}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="border shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search assignments..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value={SubmissionStatus.PENDING}>
                                                Not Started
                                            </SelectItem>
                                            <SelectItem value={SubmissionStatus.SUBMITTED}>
                                                Submitted
                                            </SelectItem>
                                            <SelectItem value={SubmissionStatus.GRADED}>
                                                Graded
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={skillFilter} onValueChange={setSkillFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Skill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Skills</SelectItem>
                                            {(Object.keys(IeltsSkill) as IeltsSkill[]).map((skill) => (
                                                <SelectItem key={skill} value={skill}>
                                                    {skillLabels[skill]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignments List */}
                    <Card className="border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Assignments
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({filteredAssignments.length} total)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredAssignments.length === 0 ? (
                                <div className="text-center py-12">
                                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No assignments found</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchQuery || statusFilter !== "all" || skillFilter !== "all"
                                            ? "Try adjusting your filters."
                                            : "You have no assignments yet."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredAssignments.map((assignment) => {
                                        const status = getStudentSubmissionStatusBadge(
                                            assignment.submissionStatus
                                        );
                                        return (
                                            <div
                                                key={assignment.id}
                                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="font-medium">
                                                            {getSkillLabel(assignment.skill)}
                                                        </Badge>
                                                        <Badge variant={status.variant}>
                                                            {status.label}
                                                        </Badge>
                                                        {assignment.isOverdue && (
                                                            <Badge variant="destructive">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold truncate">
                                                        {assignment.title}
                                                    </h4>
                                                    {assignment.course && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {assignment.course.title}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        {assignment.dueDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Due{" "}
                                                                {format(
                                                                    new Date(assignment.dueDate),
                                                                    "MMM d, yyyy"
                                                                )}
                                                            </span>
                                                        )}
                                                        {assignment.submission?.bandScore && (
                                                            <span className="flex items-center gap-1 text-green-600">
                                                                <GraduationCap className="w-3 h-3" />
                                                                Score: {assignment.submission.bandScore}
                                                                /{assignment.maxScore}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() =>
                                                        handleStartAssignment(assignment.id)
                                                    }
                                                    className="shrink-0"
                                                    variant={
                                                        assignment.submissionStatus ===
                                                            SubmissionStatus.PENDING
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                >
                                                    {assignment.submissionStatus ===
                                                        SubmissionStatus.PENDING
                                                        ? "Start Assignment"
                                                        : "View Details"}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
