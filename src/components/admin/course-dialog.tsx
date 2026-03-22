"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Course, CreateCourseInput, UpdateCourseInput } from "@/store/course.store";
import { IeltsSkill, CourseLevel } from "@/generated/prisma/enums";

interface CourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course?: Course | null;
    onSubmit: (data: CreateCourseInput | UpdateCourseInput) => Promise<void>;
    isLoading?: boolean;
}

const skills = [
    { value: IeltsSkill.LISTENING, label: "Listening" },
    { value: IeltsSkill.READING, label: "Reading" },
    { value: IeltsSkill.WRITING, label: "Writing" },
    { value: IeltsSkill.SPEAKING, label: "Speaking" }
];

const levels = [
    { value: CourseLevel.BEGINNER, label: "Beginner" },
    { value: CourseLevel.INTERMEDIATE, label: "Intermediate" },
    { value: CourseLevel.ADVANCED, label: "Advanced" }
];

export function CourseDialog({ open, onOpenChange, course, onSubmit, isLoading }: CourseDialogProps) {
    const isEditing = !!course;

    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        teacherId: string;
        thumbnailUrl: string;
        skill: IeltsSkill;
        level: CourseLevel;
        targetBand: string;
        isPublished: boolean;
    }>({
        title: "",
        description: "",
        teacherId: "",
        thumbnailUrl: "",
        skill: IeltsSkill.LISTENING,
        level: CourseLevel.BEGINNER,
        targetBand: "",
        isPublished: false
    });

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title,
                description: course.description || "",
                teacherId: course.teacherId,
                thumbnailUrl: course.thumbnailUrl || "",
                skill: course.skill,
                level: course.level,
                targetBand: course.targetBand?.toString() || "",
                isPublished: course.isPublished
            });
        } else {
            setFormData({
                title: "",
                description: "",
                teacherId: "",
                thumbnailUrl: "",
                skill: IeltsSkill.LISTENING,
                level: CourseLevel.BEGINNER,
                targetBand: "",
                isPublished: false
            });
        }
    }, [course, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: CreateCourseInput | UpdateCourseInput = {
            ...formData,
            targetBand: formData.targetBand ? parseFloat(formData.targetBand) : undefined
        };

        await onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Course" : "Create New Course"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter course title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value
                                })
                            }
                            placeholder="Enter course description"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="skill">Skill *</Label>
                            <Select
                                value={formData.skill}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        skill: value as IeltsSkill
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {skills.map((skill) => (
                                        <SelectItem key={skill.value} value={skill.value}>
                                            {skill.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Level *</Label>
                            <Select
                                value={formData.level}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        level: value as CourseLevel
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetBand">Target Band</Label>
                            <Input
                                id="targetBand"
                                type="number"
                                step="0.5"
                                min="0"
                                max="9"
                                value={formData.targetBand}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        targetBand: e.target.value
                                    })
                                }
                                placeholder="e.g., 7.0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teacherId">Teacher ID *</Label>
                        <Input
                            id="teacherId"
                            value={formData.teacherId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    teacherId: e.target.value
                                })
                            }
                            placeholder="Enter teacher ID"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                        <Input
                            id="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    thumbnailUrl: e.target.value
                                })
                            }
                            placeholder="Enter thumbnail URL"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isPublished"
                            checked={formData.isPublished}
                            onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                        />
                        <Label htmlFor="isPublished">Publish course</Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
