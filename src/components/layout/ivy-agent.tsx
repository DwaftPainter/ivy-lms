"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
    ArrowUp,
    BookOpen,
    Compass,
    Maximize2,
    Minimize2,
    Minus,
    PenLine,
    RotateCcw,
    Sparkles,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED_PROMPTS = [
    {
        label: "IELTS Reading tips",
        prompt: "Give me 3 practical tips for IELTS Reading True/False/Not Given questions.",
        icon: BookOpen
    },
    {
        label: "Writing Task 2 structure",
        prompt: "How should I structure an IELTS Writing Task 2 essay for Band 7+?",
        icon: PenLine
    },
    {
        label: "Navigate IVY LMS",
        prompt: "Where can I find my upcoming assignments and deadlines in IVY LMS?",
        icon: Compass
    }
] as const;

export function IvyAgent() {
    const id = useId();
    const launcher = useRef<HTMLButtonElement>(null);
    const composer = useRef<HTMLTextAreaElement>(null);
    const transcript = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [draft, setDraft] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) composer.current?.focus();
    }, [open]);

    useEffect(() => {
        if (transcript.current) {
            transcript.current.scrollTop = transcript.current.scrollHeight;
        }
    }, [messages, open, pending]);

    function hide() {
        setOpen(false);
        launcher.current?.focus();
    }

    function resetChat() {
        if (pending) return;
        setMessages([]);
        setError("");
        setDraft("");
        composer.current?.focus();
    }

    async function sendContent(rawContent: string) {
        const content = rawContent.trim();
        if (!content || pending) return;

        const next: Message[] = [...messages, { role: "user", content }];
        setMessages(next);
        setDraft("");
        setError("");
        setPending(true);

        try {
            const { reply } = await apiFetch<{ reply: string }>("/api/agent", {
                method: "POST",
                body: JSON.stringify({ messages: next.slice(-9) })
            });
            setMessages([...next, { role: "assistant", content: reply }]);
        } catch (cause) {
            setMessages(messages);
            setDraft(content);
            setError(getErrorMessage(cause) || "Could not send your message. Please try again.");
        } finally {
            setPending(false);
        }
    }

    async function send(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await sendContent(draft);
    }

    const panelHeaderTitle = messages.length > 0 ? "IVY Agent" : "New chat";

    return (
        <div className="relative flex items-center">
            <Button
                ref={launcher}
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                    "cursor-pointer h-7 gap-1.5 rounded-md border-border/90 bg-background px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-muted",
                    open && "border-primary/35 bg-primary/5 text-primary hover:bg-primary/10"
                )}
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                onClick={() => (open ? hide() : setOpen(true))}
            >
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                <span>IVY Agent</span>
            </Button>

            {open && (
                <section
                    id={id}
                    aria-labelledby={`${id}-title`}
                    onKeyDown={(event) => {
                        if (event.key === "Escape" && !event.nativeEvent.isComposing) {
                            event.stopPropagation();
                            hide();
                        }
                    }}
                    className={cn(
                        "fixed right-3 bottom-11 z-50 flex flex-col overflow-hidden rounded-2xl border border-border/90 bg-background text-foreground shadow-2xl transition-[width,height] duration-200 motion-reduce:transition-none md:absolute md:right-0 md:bottom-full md:mb-2",
                        expanded
                            ? "h-[min(42rem,calc(100dvh-5rem))] w-[min(32rem,calc(100vw-1.5rem))]"
                            : "h-[min(33rem,calc(100dvh-5rem))] w-[min(24.5rem,calc(100vw-1.5rem))]"
                    )}
                >
                    <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-3.5">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Sparkles className="size-3" aria-hidden="true" />
                            </span>
                            <h2
                                id={`${id}-title`}
                                className="truncate text-[13px] font-medium text-foreground"
                            >
                                {panelHeaderTitle}
                            </h2>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                            {messages.length > 0 && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    aria-label="New chat"
                                    title="New chat"
                                    disabled={pending}
                                    onClick={resetChat}
                                    className="size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <RotateCcw className="size-3.5" aria-hidden="true" />
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Minimize IVY Agent"
                                title="Minimize"
                                onClick={hide}
                                className="size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Minus className="size-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={expanded ? "Restore IVY Agent size" : "Expand IVY Agent"}
                                title={expanded ? "Restore size" : "Expand"}
                                onClick={() => setExpanded((prev) => !prev)}
                                className="hidden size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
                            >
                                {expanded ? (
                                    <Minimize2 className="size-3.5" aria-hidden="true" />
                                ) : (
                                    <Maximize2 className="size-3.5" aria-hidden="true" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Close IVY Agent"
                                title="Close"
                                onClick={hide}
                                className="size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-3.5" aria-hidden="true" />
                            </Button>
                        </div>
                    </header>

                    <div
                        ref={transcript}
                        role="log"
                        aria-label="Conversation"
                        tabIndex={0}
                        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 focus-visible:outline-none"
                    >
                        {messages.length === 0 ? (
                            <div className="flex min-h-full flex-col items-center justify-center px-2 py-6 text-center">
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary">
                                    <Sparkles className="size-5" aria-hidden="true" />
                                </div>
                                <h3 className="text-base font-semibold tracking-tight text-foreground">
                                    Welcome to IVY Agent
                                </h3>
                                <p className="mt-1 max-w-[32ch] text-xs leading-relaxed text-muted-foreground">
                                    Ask anything about IELTS practice or how to navigate IVY LMS
                                </p>

                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                    {SUGGESTED_PROMPTS.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                disabled={pending}
                                                onClick={() => void sendContent(item.prompt)}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-border/90 bg-muted/35 px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
                                            >
                                                <Icon
                                                    className="size-3.5 shrink-0 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="mt-6 text-[11px] text-muted-foreground/80">
                                    Keep personal information out of the chat.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex flex-col",
                                            message.role === "user" ? "items-end" : "items-start"
                                        )}
                                    >
                                        {message.role === "user" ? (
                                            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-xs">
                                                <p className="whitespace-pre-wrap wrap-anywhere leading-relaxed">
                                                    {message.content}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-border/80 bg-muted/35 px-3.5 py-2.5 text-foreground">
                                                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                                                    <Sparkles
                                                        className="size-3 text-primary"
                                                        aria-hidden="true"
                                                    />
                                                    <span>IVY Agent</span>
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed wrap-anywhere">
                                                    {message.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {pending && (
                                    <div className="flex items-start">
                                        <div
                                            role="status"
                                            className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border/80 bg-muted/35 px-3.5 py-2.5 text-xs text-muted-foreground"
                                        >
                                            <span className="flex items-center gap-1" aria-hidden="true">
                                                <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
                                                <span className="size-1.5 animate-pulse rounded-full bg-primary/70 delay-150 motion-reduce:animate-none" />
                                                <span className="size-1.5 animate-pulse rounded-full bg-primary/40 delay-300 motion-reduce:animate-none" />
                                            </span>
                                            <span>Preparing a reply…</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <form onSubmit={send} className="shrink-0 p-3 pt-1">
                        {error && (
                            <p
                                role="alert"
                                className="mb-2 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive"
                            >
                                {error}
                            </p>
                        )}
                        <div className="rounded-xl border border-border/90 bg-muted/25 transition-colors focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10">
                            <Textarea
                                ref={composer}
                                aria-label="Message to IVY Agent"
                                placeholder="Ask about IELTS practice or IVY LMS…"
                                rows={2}
                                maxLength={4000}
                                readOnly={pending}
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" &&
                                        !event.shiftKey &&
                                        !event.nativeEvent.isComposing
                                    ) {
                                        event.preventDefault();
                                        if (draft.trim() && !pending) {
                                            void sendContent(draft);
                                        }
                                    }
                                }}
                                className="min-h-11 max-h-28 w-full resize-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-sm shadow-none focus-visible:ring-0"
                            />
                            <div className="flex items-center justify-between gap-2 px-2.5 pb-2 pt-1">
                                <span className="text-[11px] text-muted-foreground/80">
                                    Enter to send · Shift+Enter for new line
                                </span>
                                <Button
                                    size="icon"
                                    type="submit"
                                    aria-label="Send message"
                                    disabled={pending || !draft.trim()}
                                    className="size-7 rounded-full"
                                >
                                    <ArrowUp className="size-3.5" aria-hidden="true" />
                                </Button>
                            </div>
                        </div>
                    </form>
                </section>
            )}
        </div>
    );
}
