import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { EnrollmentStatus } from "@/generated/prisma/enums";

// POST /api/student/enrollments - Enroll the logged-in student in a course
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as AuthTokenPayload;
        const userId = payload.userId;

        const body = await req.json();
        const { courseId } = body;

        // Validation
        if (!courseId) {
            return NextResponse.json(
                { success: false, message: "Course ID is required" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId: studentProfile.id,
                    courseId: courseId
                }
            }
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { success: false, message: "You are already enrolled in this course" },
                { status: StatusCodes.CONFLICT }
            );
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId: studentProfile.id,
                courseId: courseId,
                status: EnrollmentStatus.UPCOMING
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true,
                        level: true,
                        thumbnailUrl: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Enrolled successfully",
                data: enrollment
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Enrollment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// GET /api/student/enrollments - Get all enrollments for the logged-in student with progress
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as AuthTokenPayload;
        const userId = payload.userId;

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") as EnrollmentStatus | null;

        // Build where clause
        const where: Prisma.EnrollmentWhereInput = { studentId: studentProfile.id };

        if (status && Object.values(EnrollmentStatus).includes(status)) {
            where.status = status;
        }

        const enrollments = await prisma.enrollment.findMany({
            where,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        skill: true,
                        level: true,
                        targetBand: true,
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                lessons: true,
                                // assignments removed — they now live on ClassSession, not Course
                                classSessions: true
                            }
                        }
                    }
                }
            },
            orderBy: { enrolledAt: "desc" }
        });

        // Calculate progress for each enrollment
        const enrollmentsWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                const courseId = enrollment.courseId;

                // Get completed lessons
                const completedLessons = await prisma.lessonProgress.count({
                    where: {
                        studentId: studentProfile.id,
                        lesson: { courseId },
                        isCompleted: true
                    }
                });

                // Get total and completed assignments via classSession → courseId
                const [totalAssignments, completedAssignments] = await Promise.all([
                    prisma.assignment.count({
                        where: {
                            classSession: { courseId },
                            isPublished: true
                        }
                    }),
                    prisma.assignmentSubmission.count({
                        where: {
                            studentId: studentProfile.id,
                            assignment: { classSession: { courseId } },
                            status: { in: ["SUBMITTED", "GRADED", "RETURNED"] }
                        }
                    })
                ]);

                const totalLessons = enrollment.course._count.lessons;

                // Calculate completion percentage
                const totalItems = totalLessons + totalAssignments;
                const completedItems = completedLessons + completedAssignments;
                const completionPercentage =
                    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                // Auto-update enrollment status based on progress
                let currentStatus = enrollment.status;
                if (currentStatus === "UPCOMING" && completedItems > 0) {
                    currentStatus = "STUDYING";
                    await prisma.enrollment.update({
                        where: { id: enrollment.id },
                        data: { status: "STUDYING" }
                    });
                }

                if (completionPercentage === 100 && currentStatus !== "DONE") {
                    currentStatus = "DONE";
                    await prisma.enrollment.update({
                        where: { id: enrollment.id },
                        data: { status: "DONE", completedAt: new Date() }
                    });
                }

                return {
                    id: enrollment.id,
                    status: currentStatus,
                    enrolledAt: enrollment.enrolledAt,
                    courseId: enrollment.courseId,
                    completedAt: enrollment.completedAt,
                    title: enrollment.course.title,
                    description: enrollment.course.description,
                    thumbnailUrl: enrollment.course.thumbnailUrl,
                    skill: enrollment.course.skill,
                    level: enrollment.course.level,
                    teacher: enrollment.course.teacher?.user,
                    progress: {
                        totalSessions: totalLessons,
                        completedSessions: completedLessons,
                        totalAssignments,
                        completedAssignments,
                        completionPercentage
                    }
                };
            })
        );

        return NextResponse.json(
            { success: true, data: enrollmentsWithProgress },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get enrollments error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
