"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, FileText } from "lucide-react";

interface WritingAnalyticsChartProps {
    imageUrl: string | null | undefined;
    className?: string;
}

export function WritingAnalyticsChart({
    imageUrl,
    className
}: WritingAnalyticsChartProps) {
    if (!imageUrl) {
        return (
            <Card className={cn("border-border", className)}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="size-5 text-primary" />
                        Writing Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <FileText className="size-8" />
                        <p>Analytics data will be displayed here after submission.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border-border", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="size-5 text-primary" />
                    Writing Analytics
                </CardTitle>
            </CardHeader>
            <CardContent>
                
            </CardContent>
        </Card>
    );
}
