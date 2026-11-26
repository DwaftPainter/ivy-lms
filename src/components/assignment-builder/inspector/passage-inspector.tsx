"use client";

import { AudioUpload } from "@/components/ui/audio-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Passage } from "@/types/assignment-builder";
import { ImageIcon, Music } from "lucide-react";

interface PassageInspectorProps {
    passage: Passage;
    onUpdate: (updates: Partial<Passage>) => void;
}

export function PassageInspector({ passage, onUpdate }: PassageInspectorProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="passage-title">Passage Title</Label>
                <Input
                    id="passage-title"
                    value={passage.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Enter passage title"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="passage-content">Content</Label>
                <Textarea
                    id="passage-content"
                    value={passage.content || ""}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    placeholder="Enter passage content"
                    rows={10}
                />
                <p className="text-xs text-muted-foreground">
                    Word count: {passage.wordCount || 0}
                </p>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Passage Image (Optional)
                </Label>
                <ImageUpload
                    value={passage.imageUrl}
                    onChange={(url) => onUpdate({ imageUrl: url })}
                    onClear={() => onUpdate({ imageUrl: undefined })}
                    folder="assignments/passages"
                    placeholder="Upload a passage image"
                />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Audio File (Optional)
                </Label>
                <AudioUpload
                    value={passage.audioUrl}
                    onChange={(url) => onUpdate({ audioUrl: url })}
                    onClear={() => onUpdate({ audioUrl: undefined })}
                    folder="assignments/passages/audio"
                    placeholder="Upload audio for listening passage"
                    maxSizeMB={50}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                    id="source"
                    value={passage.source || ""}
                    onChange={(e) => onUpdate({ source: e.target.value })}
                    placeholder="e.g., Cambridge IELTS 17"
                />
            </div>
        </div>
    );
}
