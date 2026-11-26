"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IeltsSkill } from "@/generated/prisma/enums";
import type { CreateClassSessionInput } from "@/store/admin-class-session.store";

const SESSION_TYPES = [
    { value: "LIVE", label: "Live Session" },
    { value: "RECORDED", label: "Recorded" },
    { value: "WORKSHOP", label: "Workshop" }
];

const SKILLS = [
    { value: IeltsSkill.LISTENING, label: "Listening" },
    { value: IeltsSkill.READING, label: "Reading" },
    { value: IeltsSkill.WRITING, label: "Writing" },
    { value: IeltsSkill.SPEAKING, label: "Speaking" }
];

interface SessionFormCardProps {
    isEditing: boolean;
    isLoading: boolean;
    formData: CreateClassSessionInput;
    onChange: (next: CreateClassSessionInput) => void;
    onCancel: () => void;
    onSubmit: () => void;
}

export function SessionFormCard({
    isEditing,
    isLoading,
    formData,
    onChange,
    onCancel,
    onSubmit
}: SessionFormCardProps) {
    return (
        <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-4">
                {isEditing ? "Edit Class Session" : "Create New Class Session"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => onChange({ ...formData, title: e.target.value })}
                        placeholder="Enter session title"
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => onChange({ ...formData, description: e.target.value })}
                        placeholder="Enter session description"
                    />
                </div>

                <div>
                    <Label htmlFor="skill">Skill</Label>
                    <Select
                        value={formData.skill}
                        onValueChange={(value) =>
                            onChange({ ...formData, skill: value as IeltsSkill })
                        }
                    >
                        <SelectTrigger id="skill">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SKILLS.map((skill) => (
                                <SelectItem key={skill.value} value={skill.value}>
                                    {skill.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select
                        value={formData.sessionType}
                        onValueChange={(value) => onChange({ ...formData, sessionType: value })}
                    >
                        <SelectTrigger id="sessionType">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SESSION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => onChange({ ...formData, scheduledDate: e.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="durationMins">Duration (minutes)</Label>
                    <Input
                        id="durationMins"
                        type="number"
                        value={formData.durationMins}
                        onChange={(e) =>
                            onChange({
                                ...formData,
                                durationMins: parseInt(e.target.value, 10) || 60
                            })
                        }
                    />
                </div>

                <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => onChange({ ...formData, startTime: e.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => onChange({ ...formData, endTime: e.target.value })}
                    />
                </div>

                <div className="col-span-2">
                    <Label htmlFor="meetingUrl">Meeting URL</Label>
                    <Input
                        id="meetingUrl"
                        value={formData.meetingUrl}
                        onChange={(e) => onChange({ ...formData, meetingUrl: e.target.value })}
                        placeholder="https://..."
                    />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                    <Switch
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => onChange({ ...formData, isPublished: checked })}
                    />
                    <Label htmlFor="isPublished" className="mb-0">
                        Publish immediately
                    </Label>
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading}>
                        {isEditing ? "Update Session" : "Create Session"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
