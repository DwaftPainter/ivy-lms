"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Section } from "@/types/assignment-builder";

interface SectionInspectorProps {
    section: Section;
    onUpdate: (updates: Partial<Section>) => void;
}

export function SectionInspector({ section, onUpdate }: SectionInspectorProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                    id="section-title"
                    value={section.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter section title"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="section-desc">Description</Label>
                <Textarea
                    id="section-desc"
                    value={section.description || ""}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Enter section description"
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="part-number">Part Number</Label>
                <Input
                    id="part-number"
                    type="number"
                    value={section.partNumber}
                    onChange={(e) => onUpdate({ partNumber: parseInt(e.target.value, 10) || 1 })}
                    min={1}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="section-time">Time Limit (min)</Label>
                <Input
                    id="section-time"
                    type="number"
                    value={section.timeLimit || ""}
                    onChange={(e) =>
                        onUpdate({ timeLimit: parseInt(e.target.value, 10) || undefined })
                    }
                    placeholder="Optional"
                    min={1}
                />
            </div>
        </div>
    );
}
