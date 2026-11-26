"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IeltsSkill } from "@/generated/prisma/enums";
import type { ClassSessionDetail } from "@/store/teacher-lesson-detail.store";
import { LESSON_SKILL_LABELS } from "./lesson-display";

interface LessonDetailsFormProps {
    session: ClassSessionDetail;
    onFieldChange: <K extends keyof ClassSessionDetail>(
        field: K,
        value: ClassSessionDetail[K]
    ) => void;
}

export function LessonDetailsForm({ session, onFieldChange }: LessonDetailsFormProps) {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold">Session Information</h2>
                <p className="text-sm text-muted-foreground">
                    Edit the basic details for this class session
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input
                        id="title"
                        value={session.title}
                        onChange={(e) => onFieldChange("title", e.target.value)}
                        placeholder="Enter lesson title"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="skill">Skill Type</Label>
                    <Select
                        value={session.skill}
                        onValueChange={(value) => onFieldChange("skill", value as IeltsSkill)}
                    >
                        <SelectTrigger id="skill">
                            <SelectValue placeholder="Select skill type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(IeltsSkill).map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                    {LESSON_SKILL_LABELS[skill]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select
                        value={session.sessionType}
                        onValueChange={(value) => onFieldChange("sessionType", value)}
                    >
                        <SelectTrigger id="sessionType">
                            <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LIVE">Live Session</SelectItem>
                            <SelectItem value="RECORDED">Recorded</SelectItem>
                            <SelectItem value="WORKSHOP">Workshop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                            id="scheduledDate"
                            type="date"
                            value={session.scheduledDate.split("T")[0]}
                            onChange={(e) => onFieldChange("scheduledDate", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="durationMins">Duration (minutes)</Label>
                        <Input
                            id="durationMins"
                            type="number"
                            value={session.durationMins}
                            onChange={(e) =>
                                onFieldChange("durationMins", parseInt(e.target.value, 10))
                            }
                            min={15}
                            max={480}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={session.startTime}
                            onChange={(e) => onFieldChange("startTime", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={session.endTime}
                            onChange={(e) => onFieldChange("endTime", e.target.value)}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label htmlFor="meetingUrl">Meeting URL (optional)</Label>
                    <Input
                        id="meetingUrl"
                        type="url"
                        value={session.meetingUrl || ""}
                        onChange={(e) => onFieldChange("meetingUrl", e.target.value)}
                        placeholder="https://meet.example.com/..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}
