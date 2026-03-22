"use client";

import { Card } from "@/components/ui/card";
import { Users, BookOpen, Activity, TrendingUp } from "lucide-react";

const stats = [
    {
        title: "Total Users",
        value: "1,234",
        change: "+12%",
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-50"
    },
    {
        title: "Active Courses",
        value: "56",
        change: "+5%",
        icon: BookOpen,
        color: "text-green-500",
        bgColor: "bg-green-50"
    },
    {
        title: "Active Sessions",
        value: "89",
        change: "+23%",
        icon: Activity,
        color: "text-orange-500",
        bgColor: "bg-orange-50"
    },
    {
        title: "Completion Rate",
        value: "78%",
        change: "+8%",
        icon: TrendingUp,
        color: "text-purple-500",
        bgColor: "bg-purple-50"
    }
];

export function SystemStats() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                            <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                        </div>
                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
