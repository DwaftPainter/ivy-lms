"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onClear?: () => void;
    folder?: string;
    className?: string;
    placeholder?: string;
    accept?: string;
    maxSizeMB?: number;
}

export function ImageUpload({
    value,
    onChange,
    onClear,
    folder = "assignments",
    className,
    placeholder = "Click to upload an image",
    accept = "image/*",
    maxSizeMB = 5
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
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
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image file");
                return;
            }

            setIsUploading(true);

            try {
                const result = await uploadImage(file, folder);
                setPreviewUrl(result.url);
                onChange(result.url);
                toast.success("Image uploaded successfully");
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload image. Please try again.");
            } finally {
                setIsUploading(false);
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
        setPreviewUrl(null);
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
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {previewUrl ? (
                <Card className="relative overflow-hidden group">
                    <CardContent className="p-0">
                        <div className="relative aspect-video">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Uploaded preview"
                                className="w-full h-full object-contain"
                            />
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                                <p className="text-sm text-muted-foreground">
                                    Uploading to Cloud...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">{placeholder}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG, GIF up to {maxSizeMB}MB
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

// Simple image preview component
interface ImagePreviewProps {
    url: string;
    alt?: string;
    className?: string;
}

export function ImagePreview({ url, alt = "Preview", className }: ImagePreviewProps) {
    return (
        <div className={cn("rounded-lg overflow-hidden border bg-muted", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt={alt}
                className="w-full h-full object-contain"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
            />
        </div>
    );
}
