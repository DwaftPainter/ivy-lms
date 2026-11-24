"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X, FileAudio } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

interface AudioUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onClear?: () => void;
    folder?: string;
    className?: string;
    placeholder?: string;
    maxSizeMB?: number;
}

export function AudioUpload({
    value,
    onChange,
    onClear,
    folder = "assignments/audio",
    className,
    placeholder = "Upload audio file",
    maxSizeMB = 50
}: AudioUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file size
            if (file.size > maxSizeMB * 1024 * 1024) {
                toast.error(`File size must be less than ${maxSizeMB}MB`);
                return;
            }

            // Validate file type
            const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "audio/ogg", "audio/mp4", "audio/aac"];
            if (!validTypes.includes(file.type)) {
                toast.error("Please select a valid audio file (MP3, WAV, WEBM, OGG, AAC)");
                return;
            }

            setIsUploading(true);
            setUploadProgress(0);

            try {
                const result = await uploadFile(file, "audio", folder, (progress) => {
                    setUploadProgress(progress);
                });
                onChange(result.url);
                toast.success("Audio uploaded successfully");
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload audio. Please try again.");
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
                // Reset input
                if (inputRef.current) {
                    inputRef.current.value = "";
                }
            }
        },
        [folder, maxSizeMB, onChange]
    );

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleClear = () => {
        onClear?.();
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <input
                ref={inputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mp4,audio/aac"
                onChange={handleFileSelect}
                className="hidden"
            />

            {value ? (
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                        <audio controls className="w-full" src={value}>
                            Your browser does not support the audio element.
                        </audio>
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Replace
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClear}
                                disabled={isUploading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card
                    className={cn(
                        "relative border-2 border-dashed cursor-pointer transition-colors",
                        "hover:border-primary/50 hover:bg-muted/50",
                        isUploading && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={!isUploading ? handleClick : undefined}
                >
                    <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Uploading to Cloud...
                                    </p>
                                    {uploadProgress > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {uploadProgress}%
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <FileAudio className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">{placeholder}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        MP3, WAV, WEBM, OGG, AAC up to {maxSizeMB}MB
                                    </p>
                                </div>
                                <Button variant="secondary" size="sm" type="button">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
