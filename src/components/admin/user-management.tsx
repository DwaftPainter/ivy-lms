"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, UserPlus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTeacherStore, CreateTeacherInput } from "@/store/teacher.store";
import { CreateTeacherDialog } from "./create-teacher-dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
}

export function UserManagement() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [createdPassword, setCreatedPassword] = useState<string | null>(null);
    const { teachers, isLoading, error, fetchTeachers, createTeacher } =
        useTeacherStore();

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const handleCreateTeacher = async (data: CreateTeacherInput) => {
        try {
            const result = await createTeacher(data);
            setCreatedPassword(result.temporaryPassword);
            setIsDialogOpen(false);
            setShowSuccessAlert(true);

            // Auto-hide success alert after 10 seconds
            setTimeout(() => {
                setShowSuccessAlert(false);
                setCreatedPassword(null);
            }, 10000);
        } catch (err) {
            // Error is already handled in the store
            console.error("Failed to create teacher:", err);
        }
    };

    const mapTeachersToUsers = (teacherList: typeof teachers): User[] => {
        return teacherList.map((teacher) => ({
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            role: "Teacher",
            status: "active"
        }));
    };

    const users = mapTeachersToUsers(teachers);

    return (
        <Card className="p-6 shadow-sm border">
            {showSuccessAlert && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        Teacher created successfully! Temporary password: {" "}
                        <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono">
                            {createdPassword}
                        </code>
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-primary text-white">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                            Add Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Add Student (Coming Soon)</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CreateTeacherDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleCreateTeacher}
                isLoading={isLoading}
            />

            <div className="space-y-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{user.role}</span>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {user.status}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                    View All Users
                </Button>
            </div>
        </Card>
    );
}
