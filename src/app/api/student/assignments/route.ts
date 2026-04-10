import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { SubmissionStatus } from "@/generated/prisma/enums";

// GET /api/student/assignments - Get assignments for the logged-in student
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
                    where: { status: { in: ["STUDYING", "DONE"] } },
                    select: { courseId: true, status: true }
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
                {
                    success: true,
                    data: {
                        assignments: [],
                        progressStats: [],
                        summary: { total: 0, pending: 0, submitted: 0, graded: 0 }
                    }
                },
                { status: StatusCodes.OK }
            );
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const filterCourseId = searchParams.get("courseId");

        // Build where clause — scope assignments through classSession → courseId
        const where: any = {
            classSession: {
                courseId: { in: enrolledCourseIds }
            },
            isPublished: true
        };

        if (filterCourseId && enrolledCourseIds.includes(filterCourseId)) {
            where.classSession = { courseId: filterCourseId };
        }

        // Get assignments with their submission status
        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                classSession: {
                    select: {
                        id: true,
                        title: true,
                        scheduledDate: true,
                        startTime: true,
                        endTime: true,
                        course: {
                            select: {
                                id: true,
                                title: true,
                                thumbnailUrl: true
                            }
                        }
                    }
                },
                submissions: {
                    where: { studentId: studentProfile.id },
                    select: {
                        id: true,
                        status: true,
                        submittedAt: true,
                        gradedAt: true,
                        score: true,
                        bandScore: true,
                        feedback: true
                    }
                },
                rubric: {
                    include: {
                        criteria: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                maxScore: true
                            }
                        }
                    }
                }
            },
            orderBy: { dueDate: "asc" }
        });

        // Format the response with progress tracking
        const formattedAssignments = assignments.map((assignment) => {
            const submission = assignment.submissions[0];
            const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

            return {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                type: assignment.type,
                skill: assignment.skill,
                classSession: assignment.classSession,
                course: assignment.classSession?.course || null,
                dueDate: assignment.dueDate,
                maxScore: assignment.maxScore,
                instructions: assignment.instructions,
                attachmentUrl: assignment.attachmentUrl,
                isOverdue: isOverdue && !submission,
                submission: submission
                    ? {
                          id: submission.id,
                          status: submission.status,
                          submittedAt: submission.submittedAt,
                          gradedAt: submission.gradedAt,
                          score: submission.score,
                          bandScore: submission.bandScore,
                          feedback: submission.feedback
                      }
                    : null,
                rubric: assignment.rubric
                    ? { id: assignment.rubric.id, criteria: assignment.rubric.criteria }
                    : null,
                submissionStatus: submission?.status || SubmissionStatus.PENDING
            };
        });

        // Filter by submission status if provided
        let filteredAssignments = formattedAssignments;
        if (status) {
            const statusMap: Record<string, string> = {
                pending: SubmissionStatus.PENDING,
                submitted: SubmissionStatus.SUBMITTED,
                graded: SubmissionStatus.GRADED,
                returned: SubmissionStatus.RETURNED
            };
            const targetStatus = statusMap[status.toLowerCase()];
            if (targetStatus) {
                filteredAssignments = formattedAssignments.filter((a) => a.submissionStatus === targetStatus);
            }
        }

        // Calculate progress stats per enrolled course
        // Assignments are now counted through classSession → courseId
        const progressStats = await Promise.all(
            enrolledCourseIds.map(async (courseId) => {
                const [totalAssignments, completedSubmissions] = await Promise.all([
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
                            status: {
                                in: [
                                    SubmissionStatus.SUBMITTED,
                                    SubmissionStatus.GRADED,
                                    SubmissionStatus.RETURNED
                                ]
                            }
                        }
                    })
                ]);

                return {
                    courseId,
                    totalAssignments,
                    completedSubmissions,
                    progressPercentage:
                        totalAssignments > 0 ? Math.round((completedSubmissions / totalAssignments) * 100) : 0
                };
            })
        );

        // Auto-update enrollment status based on progress
        for (const enrollment of studentProfile.enrollments) {
            const courseProgress = progressStats.find((p) => p.courseId === enrollment.courseId);
            if (courseProgress && enrollment.status !== "DONE") {
                if (courseProgress.progressPercentage > 0 && enrollment.status === "UPCOMING") {
                    await prisma.enrollment.update({
                        where: {
                            studentId_courseId: {
                                studentId: studentProfile.id,
                                courseId: enrollment.courseId
                            }
                        },
                        data: { status: "STUDYING" }
                    });
                }
                if (courseProgress.progressPercentage === 100) {
                    await prisma.enrollment.update({
                        where: {
                            studentId_courseId: {
                                studentId: studentProfile.id,
                                courseId: enrollment.courseId
                            }
                        },
                        data: { status: "DONE", completedAt: new Date() }
                    });
                }
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    assignments: filteredAssignments,
                    progressStats,
                    summary: {
                        total: filteredAssignments.length,
                        pending: filteredAssignments.filter(
                            (a) => a.submissionStatus === SubmissionStatus.PENDING
                        ).length,
                        submitted: filteredAssignments.filter(
                            (a) => a.submissionStatus === SubmissionStatus.SUBMITTED
                        ).length,
                        graded: filteredAssignments.filter((a) =>
                            [SubmissionStatus.GRADED, SubmissionStatus.RETURNED].includes(
                                a.submissionStatus as any
                            )
                        ).length
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error: any) {
        console.error("Get student assignments error:", error);
        return NextResponse.json(
            { message: error?.message ?? "" },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
