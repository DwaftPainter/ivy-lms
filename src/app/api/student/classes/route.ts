import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";

// GET /api/student/classes - Get upcoming classes/lessons for the logged-in student
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;
        const userId = payload.userId;

        // Get student profile with lesson progress
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    where: { status: { in: ["STUDYING", "DONE"] } },
                    select: { courseId: true }
                },
                lessonProgress: {
                    where: { isCompleted: true },
                    select: { lessonId: true }
                }
            }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const enrolledCourseIds = studentProfile.enrollments.map((e) => e.courseId);
        const completedLessonIds = studentProfile.lessonProgress.map((p) => p.lessonId);
        console.log('🚀 ~ GET ~ completedLessonIds:', completedLessonIds)

        if (enrolledCourseIds.length === 0) {
            return NextResponse.json(
                { success: true, data: [] },
                { status: StatusCodes.OK }
            );
        }

        // Get upcoming lessons (not completed) from enrolled courses
        const upcomingLessons = await prisma.lesson.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                isPublished: true,
                id: {
                    notIn: completedLessonIds.length > 0 ? completedLessonIds : [""]
                }
            },
            include: {
                course: {
                    select: {
                        title: true,
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                },
                resources: {
                    select: {
                        id: true,
                        name: true,
                        fileUrl: true
                    }
                }
            },
            orderBy: {
                order: "asc"
            },
            take: 10
        });

        // Format the response with mock dates for display
        // In production, this should use actual schedule data
        const today = new Date();
        const formattedClasses = upcomingLessons.map((lesson, index) => {
            // Generate mock dates starting from tomorrow
            const sessionDate = new Date(today);
            sessionDate.setDate(today.getDate() + index * 2 + 1);

            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const month = sessionDate.getMonth() + 1;
            const date = sessionDate.getDate();
            const day = dayNames[sessionDate.getDay()];

            // Format time (e.g., "19:00 - 21:00")
            const startTime = "19:00";
            const endTime = "21:00";

            return {
                id: lesson.id,
                title: lesson.title,
                course: lesson.course.title,
                date: `${month}/${date}`,
                day: day,
                time: `${startTime} - ${endTime}`,
                instructor: `${lesson.course.teacher.user.firstName} ${lesson.course.teacher.user.lastName}`,
                description: lesson.description,
                materials: lesson.resources
            };
        });

        return NextResponse.json(
            {
                success: true,
                data: formattedClasses
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get student classes error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
