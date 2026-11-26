"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { IeltsSkill } from "@/generated/prisma/enums";
import { IELTS_SKILL_LABELS } from "@/lib/ielts-badges";
import type { StatusFilterValue } from "@/lib/student-assignments";
import { cn } from "@/lib/utils";
import { RotateCcw, Search, X } from "lucide-react";

interface AssignmentFiltersBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: StatusFilterValue;
    onStatusChange: (value: StatusFilterValue) => void;
    skillFilter: string;
    onSkillChange: (value: string) => void;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function AssignmentFiltersBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    skillFilter,
    onSkillChange,
    hasActiveFilters,
    onReset
}: AssignmentFiltersBarProps) {
    return (
        <section aria-label="Filter assignments">
            <Card className="p-3.5 shadow-none sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1 min-w-0">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            placeholder="Search by assignment or course..."
                            aria-label="Search assignments"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className={cn("pl-9", searchQuery && "pr-9")}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                aria-label="Clear search"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                            >
                                <X className="size-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => onStatusChange(value as StatusFilterValue)}
                        >
                            <SelectTrigger aria-label="Filter by status" className="w-full sm:w-44">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="todo">To do</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="in_progress">In progress</SelectItem>
                                <SelectItem value="not_started">Not started</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="graded">Graded</SelectItem>
                                <SelectItem value="returned">Returned</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={skillFilter} onValueChange={onSkillChange}>
                            <SelectTrigger aria-label="Filter by skill" className="w-full sm:w-40">
                                <SelectValue placeholder="All skills" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All skills</SelectItem>
                                {(Object.keys(IeltsSkill) as IeltsSkill[]).map((skill) => (
                                    <SelectItem key={skill} value={skill}>
                                        {IELTS_SKILL_LABELS[skill]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onReset}
                                className="col-span-2 justify-center sm:col-span-1"
                            >
                                <RotateCcw className="size-3.5" aria-hidden="true" />
                                Reset filters
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </section>
    );
}
