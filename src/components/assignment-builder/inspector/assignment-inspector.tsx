"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Assignment } from "@/types/assignment-builder";

interface AssignmentInspectorProps {
    assignment: Assignment;
    onUpdate: (updates: Partial<Assignment>) => void;
}

export function AssignmentInspector({ assignment, onUpdate }: AssignmentInspectorProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                    id="title"
                    value={assignment.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter assignment title"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={assignment.description || ""}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Enter assignment description"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="time">Time Limit (min)</Label>
                    <Input
                        id="time"
                        type="number"
                        value={assignment.totalTime}
                        onChange={(e) => onUpdate({ totalTime: parseInt(e.target.value, 10) || 0 })}
                        min={1}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="points">Total Points</Label>
                    <Input
                        id="points"
                        type="number"
                        value={assignment.totalPoints}
                        onChange={(e) => onUpdate({ totalPoints: parseInt(e.target.value, 10) || 0 })}
                        min={1}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                    id="instructions"
                    value={assignment.instructions || ""}
                    onChange={(e) => onUpdate({ instructions: e.target.value })}
                    placeholder="Enter instructions for students"
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="isPublished">Publication Status</Label>
                <Select
                    value={assignment.metadata?.isPublished ? "published" : "draft"}
                    onValueChange={(value) =>
                        onUpdate({
                            metadata: { ...assignment.metadata, isPublished: value === "published" }
                        })
                    }
                >
                    <SelectTrigger id="isPublished">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
