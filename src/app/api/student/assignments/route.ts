import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { SubmissionStatus } from "@/generated/prisma/enums";

// GET /api/student/assignments - Get upcoming assignments for the logged-in student
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

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                enrollments: {
                    where: { status: { in: ["ACTIVE", "COMPLETED"] } },
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
            return NextResponse.json(
                { success: true, data: [] },
                { status: StatusCodes.OK }
            );
        }

        // Get assignments from enrolled courses with their submission status
        const assignments = await prisma.assignment.findMany({
            where: {
                courseId: { in: enrolledCourseIds },
                isPublished: true,
                dueDate: {
                    gte: new Date() // Only upcoming assignments
                }
            },
            include: {
                course: {
                    select: {
                        title: true
                    }
                },
                submissions: {
                    where: {
                        studentId: studentProfile.id
                    },
                    select: {
                        status: true,
                        submittedAt: true
                    }
                }
            },
            orderBy: {
                dueDate: "asc"
            },
            take: 10 // Limit to 10 upcoming assignments
        });

        // Format the response
        const formattedAssignments = assignments.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            course: assignment.course.title,
            dueDate: assignment.dueDate,
            type: assignment.type,
            skill: assignment.skill,
            status: assignment.submissions[0]?.status || SubmissionStatus.PENDING,
            submittedAt: assignment.submissions[0]?.submittedAt
        }));

        return NextResponse.json(
            {
                success: true,
                data: formattedAssignments
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get student assignments error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
