"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherStore, type CreateTeacherInput } from "@/store/teacher.store";
import { getSkillLabel } from "@/lib/ielts-badges";
import { CreateTeacherDialog } from "./create-teacher-dialog";
import { AlertCircle, CheckCircle2, RotateCcw, UserPlus, Users, X } from "lucide-react";

function getInitials(firstName: string, lastName: string): string {
    const first = firstName.trim()[0] || "";
    const last = lastName.trim()[0] || "";
    return `${first}${last}`.toUpperCase() || "T";
}

export function UserManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const addTeacherBtnRef = useRef<HTMLButtonElement>(null);
    const [createdTeacher, setCreatedTeacher] = useState<{
        name: string;
        temporaryPassword: string;
    } | null>(null);

    const { teachers, isLoading, isCreating, error, fetchTeachers, createTeacher } =
        useTeacherStore();

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const handleCreateTeacher = async (data: CreateTeacherInput) => {
        const result = await createTeacher(data);
        setCreatedTeacher({
            name: `${result.firstName} ${result.lastName}`.trim(),
            temporaryPassword: result.temporaryPassword
        });
        setIsDialogOpen(false);
    };

    return (
        <section aria-labelledby="admin-teachers-heading" className="min-w-0">
            <Card className="gap-0 py-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
                        <h2 id="admin-teachers-heading" className="text-base font-semibold text-foreground">
                            Teachers
                        </h2>
                        {!isLoading && !error && (
                            <span className="text-sm text-muted-foreground tabular-nums">
                                ({teachers.length})
                            </span>
                        )}
                    </div>
                    <Button
                        ref={addTeacherBtnRef}
                        type="button"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                        className="shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <UserPlus className="size-4" aria-hidden="true" />
                        <span>Add teacher</span>
                    </Button>
                </div>

                {createdTeacher && (
                    <div className="border-b px-4 py-3 sm:px-6">
                        <Alert className="border-primary/20 bg-primary/5">
                            <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                            <AlertDescription className="flex items-start justify-between gap-3 text-sm text-foreground">
                                <div className="min-w-0 [overflow-wrap:anywhere]">
                                    <p className="font-medium">
                                        Added {createdTeacher.name}. Temporary password:
                                    </p>
                                    <code className="mt-1 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                                        {createdTeacher.temporaryPassword}
                                    </code>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreatedTeacher(null)}
                                    aria-label="Dismiss teacher password notice"
                                    className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                                >
                                    <X className="size-4" aria-hidden="true" />
                                </button>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {isLoading && teachers.length === 0 ? (
                    <div className="divide-y" aria-busy="true">
                        <p role="status" className="sr-only">
                            Loading teachers
                        </p>
                        {[1, 2].map((item) => (
                            <div key={item} className="flex items-center gap-3 px-4 py-4 sm:px-6">
                                <Skeleton className="size-9 rounded-full shrink-0 motion-reduce:animate-none" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-36 motion-reduce:animate-none" />
                                    <Skeleton className="h-3 w-48 motion-reduce:animate-none" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error && teachers.length === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <div role="alert" className="flex items-start gap-3">
                            <AlertCircle
                                className="mt-0.5 size-5 shrink-0 text-destructive"
                                aria-hidden="true"
                            />
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Could not load teachers
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchTeachers()}
                                >
                                    <RotateCcw className="size-4" aria-hidden="true" />
                                    Retry teachers
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                ) : teachers.length === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    No teachers yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a teacher account to assign instructors to courses.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <UserPlus className="size-4" aria-hidden="true" />
                                Add teacher
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        {error && (
                            <div className="border-b px-4 py-3 sm:px-6">
                                <Alert variant="destructive">
                                    <AlertCircle className="size-4" aria-hidden="true" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                        <ul className="divide-y">
                            {teachers.map((teacher) => {
                                const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();
                                const expertise = teacher.teacherProfile?.expertise ?? [];

                                return (
                                    <li
                                        key={teacher.id}
                                        className="flex items-start gap-3 px-4 py-3.5 sm:px-6"
                                    >
                                        <Avatar className="mt-0.5 size-9 shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                                {getInitials(teacher.firstName, teacher.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                                                {fullName}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-muted-foreground [overflow-wrap:anywhere]">
                                                {teacher.email}
                                            </p>
                                            {expertise.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {expertise.map((skill) => (
                                                        <Badge key={skill} variant="secondary">
                                                            {getSkillLabel(skill)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </Card>

            <CreateTeacherDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleCreateTeacher}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    requestAnimationFrame(() => addTeacherBtnRef.current?.focus());
                }}
                isLoading={isCreating}
            />
        </section>
    );
}
