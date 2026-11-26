"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { SessionStatus } from "@/lib/session-status";
import { Calendar, Check, CheckCircle2, Eye, PlayCircle } from "lucide-react";

interface LessonAccessPanelProps {
    isPublished: boolean;
    sessionStatus: SessionStatus | null;
    isSaving: boolean;
    onPublishToggle: () => void;
}

const ACCESS_RULES = [
    "Teachers can access and edit sessions at any time",
    "Students can see upcoming sessions in their schedule",
    "Linked assignments are accessible based on their individual settings"
];

export function LessonAccessPanel({
    isPublished,
    sessionStatus,
    isSaving,
    onPublishToggle
}: LessonAccessPanelProps) {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold">Access Control</h2>
                <p className="text-sm text-muted-foreground">
                    Configure when students can access this session
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Publish Session</p>
                            <p className="text-sm text-muted-foreground">
                                Make this session visible to enrolled students
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={isPublished}
                        onCheckedChange={onPublishToggle}
                        disabled={isSaving}
                        aria-label="Publish Session"
                    />
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="font-medium">Session Status</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                            className={`p-4 border rounded-lg ${sessionStatus === "UPCOMING" ? "border-primary bg-primary/5" : ""}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Upcoming</span>
                                {sessionStatus === "UPCOMING" && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        Current
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Session has not started yet
                            </p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg ${sessionStatus === "ONGOING" ? "border-primary bg-primary/5" : ""}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <PlayCircle className="w-4 h-4 text-emerald-500" />
                                <span className="font-medium">Ongoing</span>
                                {sessionStatus === "ONGOING" && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        Current
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Session is currently in progress
                            </p>
                        </div>
                        <div
                            className={`p-4 border rounded-lg ${sessionStatus === "COMPLETED" ? "border-primary bg-primary/5" : ""}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Completed</span>
                                {sessionStatus === "COMPLETED" && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                        Current
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">Session has ended</p>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Access Rules</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {ACCESS_RULES.map((rule) => (
                            <li key={rule} className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 text-green-500" />
                                <span>{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
