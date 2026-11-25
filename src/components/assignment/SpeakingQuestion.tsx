"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Question } from "@/store/assignment-session.store";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { uploadAudio } from "@/lib/upload";
import { toast } from "sonner";

interface SpeakingQuestionProps {
    question: Question;
    answer: string; // This will be the Cloudinary audio URL
    onAnswerChange: (value: string) => void;
    questionNumber: number;
    partTimeLimit?: number; // in seconds
    isSubmitted?: boolean;
    assignmentId?: string;
}

export function SpeakingQuestion({
    question,
    answer,
    onAnswerChange,
    questionNumber,
    partTimeLimit,
    isSubmitted,
    assignmentId
}: SpeakingQuestionProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(answer || null);
    const [isUploading, setIsUploading] = useState(false);
    const [_uploadProgress, setUploadProgress] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { startTimer, pauseTimer, tickTimer } = useAssignmentSessionStore();

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
                tickTimer();
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording, tickTimer]);

    // Auto-stop recording when time limit is reached
    useEffect(() => {
        if (isRecording && partTimeLimit && recordingTime >= partTimeLimit) {
            stopRecording();
        }
    }, [recordingTime, partTimeLimit, isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus"
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

                // Upload to Cloudinary
                setIsUploading(true);
                setUploadProgress(0);

                try {
                    const result = await uploadAudio(
                        audioBlob,
                        `speaking-${question.id}-${Date.now()}.webm`,
                        assignmentId ? `student-audio/${assignmentId}` : "student-audio"
                    );

                    setAudioUrl(result.url);
                    onAnswerChange(result.url);
                    toast.success("Recording uploaded successfully");
                } catch (error) {
                    console.error("Upload error:", error);
                    toast.error("Failed to upload recording. Please try again.");
                } finally {
                    setIsUploading(false);
                    setUploadProgress(0);
                }

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            setRecordingTime(0);
            if (partTimeLimit) {
                startTimer(partTimeLimit);
            }
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Could not access microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            pauseTimer();
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handlePlaybackEnded = () => {
        setIsPlaying(false);
    };

    const rerecord = () => {
        setAudioUrl(null);
        onAnswerChange("");
        setRecordingTime(0);
        toast.info("Previous recording cleared. You can now re-record.");
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-relaxed">
                    <span className="text-primary font-semibold mr-2">{questionNumber}.</span>
                    {question.prompt}
                </CardTitle>
                {partTimeLimit && (
                    <p className="text-sm text-muted-foreground">Time limit: {formatTime(partTimeLimit)}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Recording Controls */}
                <div className="flex flex-col items-center gap-4">
                    {/* Timer Display */}
                    {isRecording && (
                        <div className="text-4xl font-mono font-bold text-destructive">
                            {formatTime(recordingTime)}
                        </div>
                    )}

                    {/* Upload Progress
                    {isUploading && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Uploading to Cloud...</p>
                        </div>
                    )} */}

                    {/* Main Recording Button */}
                    {!audioUrl && !isUploading ? (
                        <Button
                            size="lg"
                            onClick={isRecording ? stopRecording : startRecording}
                            variant={isRecording ? "destructive" : "default"}
                            disabled={isSubmitted}
                            className={cn("h-16 w-16 rounded-full", isRecording && "animate-pulse")}
                        >
                            {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                    ) : (
                        !isUploading && (
                            <div className="flex items-center gap-3">
                                <Button
                                    size="lg"
                                    onClick={togglePlayback}
                                    variant="outline"
                                    className="h-14 w-14 rounded-full"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5 ml-0.5" />
                                    )}
                                </Button>
                                {!isSubmitted && (
                                    <Button
                                        size="lg"
                                        onClick={rerecord}
                                        variant="outline"
                                        className="h-14 w-14 rounded-full"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        )
                    )}

                    {/* Status Text */}
                    <p className="text-sm text-muted-foreground">
                        {isSubmitted
                            ? audioUrl
                                ? "Your response has been submitted. You can play to review."
                                : "No recording submitted"
                            : isUploading
                              ? "Uploading..."
                              : isRecording
                                ? "Recording... Click to stop"
                                : audioUrl
                                  ? "Recording saved to cloud. Play to review or re-record."
                                  : "Click the microphone to start recording"}
                    </p>
                </div>

                {/* Audio Playback */}
                {audioUrl && !isUploading && (
                    <div className="bg-muted/50 rounded-lg p-4">
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={handlePlaybackEnded}
                            className="w-full"
                            controls
                        />
                    </div>
                )}

                {/* Guidelines */}
                {!isSubmitted && (
                    <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-2">Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Speak clearly and at a natural pace</li>
                            <li>Try to use a variety of vocabulary and grammar structures</li>
                            <li>If you make a mistake, just continue speaking</li>
                            <li>Recordings are automatically uploaded to cloud storage</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
