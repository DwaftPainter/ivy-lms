"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Headphones, BookOpen } from "lucide-react";

interface SectionContentProps {
    audioUrl?: string;
    passage?: string;
    imageUrl?: string;
    title?: string;
}

export function SectionContent({ audioUrl, passage, imageUrl, title }: SectionContentProps) {
    const illustrationUrl = imageUrl?.trim();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioUrl) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.addEventListener("loadedmetadata", () => {
                setDuration(audioRef.current?.duration || 0);
            });
            audioRef.current.addEventListener("timeupdate", () => {
                setCurrentTime(audioRef.current?.currentTime || 0);
            });
            audioRef.current.addEventListener("ended", () => {
                setIsPlaying(false);
            });

            return () => {
                audioRef.current?.pause();
                audioRef.current = null;
            };
        }
    }, [audioUrl]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.volume = value[0] / 100;
            setVolume(value[0]);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const hasContent = audioUrl || passage || imageUrl;
    if (!hasContent) return null;

    return (
        <Card className="border-border mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    {audioUrl && <Headphones className="h-4 w-4" aria-hidden="true" />}
                    {passage && !audioUrl && <BookOpen className="h-4 w-4" aria-hidden="true" />}
                    {title || (audioUrl ? "Listening Audio" : "Reading Passage")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Audio Player */}
                {audioUrl && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={togglePlay}
                                aria-label={isPlaying ? "Pause section audio" : "Play section audio"}
                                className="h-10 w-10 shrink-0"
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <Play className="h-4 w-4 ml-0.5" aria-hidden="true" />
                                )}
                            </Button>
                            <div className="flex-1">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={1}
                                    aria-label="Section audio progress"
                                    onValueChange={handleSeek}
                                    className="w-full"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <Slider
                                value={[volume]}
                                max={100}
                                step={1}
                                aria-label="Section audio volume"
                                onValueChange={handleVolumeChange}
                                className="w-24"
                            />
                        </div>
                    </div>
                )}

                {/* The browser sizes uploaded images from their intrinsic dimensions. */}
                {illustrationUrl && (
                    <div className="rounded-lg overflow-hidden border">
                        <Image
                            src={illustrationUrl}
                            alt="Section illustration"
                            width={0}
                            height={0}
                            unoptimized
                            className="w-full h-auto max-h-[400px] object-contain bg-muted"
                        />
                    </div>
                )}

                {/* Passage Text */}
                {passage && (
                    <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Reading Material</span>
                        </div>
                        <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                            {passage}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
