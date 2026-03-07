"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface Assignment {
    course: string;
    title: string;
    deadline: string;
}

const assignments: Assignment[] = [
    {
        course: "IELTS Basic",
        title: "IELTS Writing Lesson 17",
        deadline: "23:59 - 30/1"
    },
    {
        course: "IELTS Basic",
        title: "IELTS Reading Lesson 20",
        deadline: "23:59 - 30/1"
    }
];

const UpcomingAssignments = () => {
    return (
        <Card className="p-6 rounded-md shadow-0">
            <h2 className="text-xl font-bold mb-6">Upcoming Assignments</h2>

            <div className="space-y-4">
                {assignments.map((assignment, idx) => (
                    <div key={idx} className="bg-muted rounded-lg p-6 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">{assignment.course}</p>
                            <h3 className="font-bold text-lg mb-4">{assignment.title}</h3>

                            <div className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 rounded font-medium text-sm">
                                <Calendar className="w-4 h-4" />
                                {assignment.deadline}
                            </div>
                        </div>

                        <Button className="bg-accent hover:bg-accent/90 text-white font-medium" size="lg">
                            Finish Now
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default UpcomingAssignments;
