import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/student/schedule:
 *   get:
 *     summary: Get schedule for the logged-in student
 *     description: Returns all class sessions for the student's enrolled courses in calendar format
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Student profile not found
 *       500:
 *         description: Internal server error
 */

// GET /api/student/schedule - Get all class sessions for the logged-in student
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as { userId: string };
        const userId = payload.userId;

        // Get student profile with enrollments
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    where: { status: { in: ["STUDYING", "DONE"] } },
                    select: { courseId: true }
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

        if (enrolledCourseIds.length === 0) {
            return NextResponse.json({ success: true, data: [] }, { status: StatusCodes.OK });
        }

        // Get all class sessions from enrolled courses (including past and future)
        const classSessions = await prisma.classSession.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                isPublished: true
            },
            include: {
                course: {
                    select: {
                        title: true,
                        skill: true,
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
                }
            },
            orderBy: {
                scheduledDate: "asc"
            }
        });

        // Format the response for FullCalendar
        const scheduleLessons = classSessions.map((session) => {
            const sessionDate = new Date(session.scheduledDate);
            const dateStr = sessionDate.toISOString().split("T")[0]; // YYYY-MM-DD format

            return {
                id: session.id,
                title: session.title,
                course: session.course.title,
                date: dateStr,
                startTime: session.startTime,
                endTime: session.endTime,
                type: session.course.skill,
                instructor: `${session.course.teacher.user.firstName} ${session.course.teacher.user.lastName}`
            };
        });

        return NextResponse.json(
            {
                success: true,
                data: scheduleLessons
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Get student schedule error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
