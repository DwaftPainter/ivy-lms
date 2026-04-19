import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { SubmissionStatus, Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/assignments/{id}/submissions:
 *   get:
 *     summary: Get all submissions for an assignment
 *     description: Returns all student submissions for a specific assignment that need grading
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a teacher or doesn't own this course
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/assignments/[id]/submissions - Get all submissions for an assignment
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Get user with teacher profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: true }
        });

        if (!user || user.role !== Role.TEACHER) {
            return NextResponse.json(
                { success: false, message: "Access denied. Teachers only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const teacherProfileId = user.teacherProfile?.id;
        if (!teacherProfileId) {
            return NextResponse.json(
                { success: false, message: "Teacher profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const { id: assignmentId } = await params;

        // Verify the assignment exists and belongs to this teacher
        // Ownership now traverses assignment → classSession → course → teacherId
        const assignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                classSession: {
                    course: { teacherId: teacherProfileId }
                }
            },
            include: {
                classSession: {
                    select: {
                        id: true,
                        title: true,
                        scheduledDate: true,
                        course: {
                            select: {
                                title: true,
                                skill: true
                            }
                        }
                    }
                },
                rubric: {
                    include: { criteria: true }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Get all submissions for this assignment
        const submissions = await prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                criteriaScores: {
                    include: { criterion: true }
                },
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: [
                { status: "asc" }, // PENDING first, then SUBMITTED, then GRADED
                { submittedAt: "desc" }
            ]
        });

        // Format submissions
        const formattedSubmissions = submissions.map((submission) => ({
            id: submission.id,
            student: {
                id: submission.student.id,
                firstName: submission.student.user.firstName,
                lastName: submission.student.user.lastName,
                email: submission.student.user.email,
                avatarUrl: submission.student.user.avatarUrl
            },
            status: submission.status,
            content: submission.content,
            fileUrl: submission.fileUrl,
            audioUrl: submission.audioUrl,
            audioUrls: submission.audioUrls,
            score: submission.score,
            bandScore: submission.bandScore,
            feedback: submission.feedback,
            submittedAt: submission.submittedAt?.toISOString() || null,
            gradedAt: submission.gradedAt?.toISOString() || null,
            criteriaScores: submission.criteriaScores.map((cs) => ({
                criterionId: cs.criterionId,
                criterionName: cs.criterion.name,
                score: cs.score
            })),
            commentCount: submission._count.comments
        }));

        // Group submissions by status
        const pendingCount = submissions.filter(
            (s) => s.status === SubmissionStatus.PENDING || s.status === SubmissionStatus.SUBMITTED
        ).length;
        const gradedCount = submissions.filter(
            (s) => s.status === SubmissionStatus.GRADED || s.status === SubmissionStatus.RETURNED
        ).length;

        return NextResponse.json(
            {
                success: true,
                data: {
                    assignment: {
                        id: assignment.id,
                        title: assignment.title,
                        description: assignment.description,
                        type: assignment.type,
                        skill: assignment.skill,
                        // Surface both session context and course name for the UI
                        classSession: assignment.classSession,
                        courseName: assignment.classSession?.course?.title || "Unknown Course",
                        dueDate: assignment.dueDate?.toISOString() || null,
                        maxScore: assignment.maxScore,
                        rubric: assignment.rubric
                    },
                    submissions: formattedSubmissions,
                    summary: {
                        totalSubmissions: submissions.length,
                        pendingCount,
                        gradedCount
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get assignment submissions error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
