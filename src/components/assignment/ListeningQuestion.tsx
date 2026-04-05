"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Question } from "@/store/assignment-session.store";
import { Play, Pause, Volume2, Headphones } from "lucide-react";

interface ListeningQuestionProps {
    question: Question;
    answer: string;
    onAnswerChange: (value: string) => void;
    questionNumber: number;
    audioUrl?: string;
}

export function ListeningQuestion({
    question,
    answer,
    onAnswerChange,
    questionNumber,
    audioUrl
}: ListeningQuestionProps) {
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

    const renderQuestionInput = () => {
        switch (question.type) {
            case "multiple_choice":
                return (
                    <RadioGroup
                        value={answer || ""}
                        onValueChange={onAnswerChange}
                        className="space-y-2"
                    >
                        {question.options?.map((option, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                                    "hover:bg-muted/50 cursor-pointer",
                                    answer === option && "border-primary bg-primary/5"
                                )}
                            >
                                <RadioGroupItem value={option} id={`listen-opt-${index}`} />
                                <Label
                                    htmlFor={`listen-opt-${index}`}
                                    className="flex-1 cursor-pointer font-normal"
                                >
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "fill_blank":
                return (
                    <Input
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here"
                        className="max-w-md"
                    />
                );

            default:
                return (
                    <Input
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here"
                        className="max-w-md"
                    />
                );
        }
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-relaxed">
                    <span className="text-primary font-semibold mr-2">
                        {questionNumber}.
                    </span>
                    {question.prompt}
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
                                className="h-10 w-10"
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4 ml-0.5" />
                                )}
                            </Button>
                            <div className="flex-1">
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={1}
                                    onValueChange={handleSeek}
                                    className="w-full"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <Slider
                                value={[volume]}
                                max={100}
                                step={1}
                                onValueChange={handleVolumeChange}
                                className="w-24"
                            />
                        </div>
                    </div>
                )}

                {/* Fallback when no audio URL */}
                {!audioUrl && (
                    <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3 text-muted-foreground">
                        <Headphones className="h-5 w-5" />
                        <span>Audio will play automatically during the test</span>
                    </div>
                )}

                {/* Question Input */}
                {renderQuestionInput()}
            </CardContent>
        </Card>
    );
}
