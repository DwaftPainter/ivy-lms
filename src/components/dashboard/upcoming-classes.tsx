"use client";

import { Card } from "@/components/ui/card";
import { Paperclip, Clock, User } from "lucide-react";

interface ClassItem {
    date: string;
    day: string;
    title: string;
    course: string;
    time: string;
    instructor: string;
}

const classes: ClassItem[] = [
    {
        date: "2/2",
        day: "Tue",
        title: "Lesson 21: Writing",
        course: "Course: IELTS Basic",
        time: "19:00 - 21:00",
        instructor: "Lionel Messi"
    },
    {
        date: "4/2",
        day: "Thu",
        title: "Lesson 22: Listening",
        course: "Course: IELTS Basic",
        time: "19:00 - 21:00",
        instructor: "Cris Ronaldo"
    }
];

const UpcomingClasses = () => {
    return (
        <Card className="p-6 rounded-md">
            <h2 className="text-xl font-bold mb-6">Upcoming Classes</h2>

            <div className="space-y-6">
                {classes.map((lesson, idx) => (
                    <div key={idx} className="pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="flex gap-4">
                            {/* Date Box */}
                            <div className="bg-muted rounded-lg p-4 text-center flex flex-col items-center justify-center w-20 flex-shrink-0">
                                <div className="font-bold text-lg">{lesson.date}</div>
                                <div className="text-sm text-muted-foreground">{lesson.day}</div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{lesson.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{lesson.course}</p>

                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 text-accent font-medium text-sm hover:underline"
                                >
                                    <Paperclip className="w-4 h-4" />
                                    View Material
                                </a>
                            </div>

                            {/* Right Info */}
                            <div className="text-right space-y-2">
                                <div className="flex items-center justify-end gap-2 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{lesson.time}</span>
                                </div>
                                <div className="flex items-center justify-end gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{lesson.instructor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default UpcomingClasses;
