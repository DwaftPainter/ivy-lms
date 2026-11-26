"use client";

import { cn } from "@/lib/utils";
import type { ComponentLibraryItem } from "@/types/assignment-builder";
import {
    BookOpen,
    CircleDot,
    ClipboardList,
    FileText,
    GitBranch,
    GitCompare,
    GripVertical,
    Headphones,
    Image as ImageIcon,
    Layers,
    Link,
    List,
    Map,
    MessageSquare,
    Plus,
    Scale,
    SquareCheck,
    Table,
    TextCursor,
    ThumbsUp
} from "lucide-react";

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
    Layers: <Layers className="h-4 w-4" />,
    FileText: <FileText className="h-4 w-4" />,
    Headphones: <Headphones className="h-4 w-4" />,
    "circle-dot": <CircleDot className="h-4 w-4" />,
    "square-check": <SquareCheck className="h-4 w-4" />,
    List: <List className="h-4 w-4" />,
    Link: <Link className="h-4 w-4" />,
    "git-compare": <GitCompare className="h-4 w-4" />,
    "text-cursor": <TextCursor className="h-4 w-4" />,
    "book-open": <BookOpen className="h-4 w-4" />,
    Scale: <Scale className="h-4 w-4" />,
    "thumbs-up": <ThumbsUp className="h-4 w-4" />,
    "clipboard-list": <ClipboardList className="h-4 w-4" />,
    Table: <Table className="h-4 w-4" />,
    "git-branch": <GitBranch className="h-4 w-4" />,
    Map: <Map className="h-4 w-4" />,
    Image: <ImageIcon className="h-4 w-4" />,
    "message-square": <MessageSquare className="h-4 w-4" />
};

interface DraggableLibraryItemProps {
    item: ComponentLibraryItem;
    questionType?: string;
    disabledReason?: string;
    onInsert?: () => void;
}

export function DraggableLibraryItem({
    item,
    questionType,
    disabledReason,
    onInsert
}: DraggableLibraryItemProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData(
            "application/json",
            JSON.stringify({
                ...item,
                questionType
            })
        );
        e.dataTransfer.effectAllowed = "copy";
    };

    const iconNode = ICON_COMPONENTS[item.icon] || <FileText className="h-4 w-4" />;

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className={cn(
                "group flex items-center gap-1 rounded-md cursor-grab",
                "hover:bg-accent hover:text-accent-foreground",
                "active:cursor-grabbing",
                "transition-colors duration-150",
                disabledReason && "opacity-75"
            )}
        >
            <GripVertical
                className="h-4 w-4 ml-1 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                aria-hidden="true"
            />
            <button
                type="button"
                onClick={onInsert}
                aria-label={
                    disabledReason ? `${item.label} (${disabledReason})` : `Insert ${item.label}`
                }
                title={disabledReason ? `${item.label} (${disabledReason})` : `Insert ${item.label}`}
                className={cn(
                    "flex flex-1 min-w-0 items-center gap-3 p-2 pl-1 text-left rounded-md cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
            >
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    {iconNode}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {disabledReason ? disabledReason : item.description}
                    </p>
                </div>
                <Plus
                    className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 shrink-0"
                    aria-hidden="true"
                />
            </button>
        </div>
    );
}
