import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { SubmissionStatus, Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/submissions/{id}:
 *   get:
 *     summary: Get a specific submission for grading
 *     description: Returns detailed submission information for grading
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
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Grade a submission
 *     description: Updates a submission with grade and feedback
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
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 description: Raw score (optional for drafts)
 *               bandScore:
 *                 type: number
 *                 description: IELTS band score 0-9 (optional for drafts)
 *               feedback:
 *                 type: string
 *                 description: Teacher feedback (optional for drafts)
 *               isDraft:
 *                 type: boolean
 *                 description: If true, saves a draft for a submission whose grade has not been published
 *               criteriaScores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     criterionId:
 *                       type: string
 *                     score:
 *                       type: number
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       409:
 *         description: A draft cannot replace a published grade
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/submissions/[id] - Get a specific submission
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: submissionId } = await params;

        // Get submission — ownership via submission → assignment → classSession → course → teacherId
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    classSession: {
                        course: { teacherId: teacherProfileId }
                    }
                }
            },
            include: {
                assignment: {
                    include: {
                        classSession: {
                            select: {
                                title: true,
                                scheduledDate: true,
                                course: {
                                    select: { title: true, skill: true }
                                }
                            }
                        },
                        rubric: {
                            include: { criteria: true }
                        }
                    }
                },
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
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                role: true,
                                avatarUrl: true
                            }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "Submission not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    submission: {
                        id: submission.id,
                        status: submission.status,
                        content: submission.content,
                        fileUrl: submission.fileUrl,
                        audioUrl: submission.audioUrl,
                        audioUrls: submission.audioUrls,
                        score: submission.score,
                        bandScore: submission.bandScore,
                        feedback: submission.feedback,
                        submittedAt: submission.submittedAt?.toISOString() || null,
                        gradedAt: submission.gradedAt?.toISOString() || null
                    },
                    student: {
                        id: submission.student.id,
                        firstName: submission.student.user.firstName,
                        lastName: submission.student.user.lastName,
                        email: submission.student.user.email,
                        avatarUrl: submission.student.user.avatarUrl
                    },
                    assignment: {
                        id: submission.assignment.id,
                        title: submission.assignment.title,
                        description: submission.assignment.description,
                        type: submission.assignment.type,
                        skill: submission.assignment.skill,
                        // Course name now sourced through classSession
                        courseName: submission.assignment.classSession?.course?.title || "Unknown Course",
                        sessionTitle: submission.assignment.classSession?.title || "Unlinked",
                        dueDate: submission.assignment.dueDate?.toISOString() || null,
                        maxScore: submission.assignment.maxScore
                    },
                    rubric: submission.assignment.rubric,
                    criteriaScores: submission.criteriaScores.map((cs) => ({
                        id: cs.id,
                        criterionId: cs.criterionId,
                        criterionName: cs.criterion.name,
                        maxScore: cs.criterion.maxScore,
                        score: cs.score
                    })),
                    comments: submission.comments.map((comment) => ({
                        id: comment.id,
                        content: comment.content,
                        author: `${comment.author.firstName} ${comment.author.lastName}`,
                        role: comment.author.role,
                        avatarUrl: comment.author.avatarUrl,
                        createdAt: comment.createdAt.toISOString()
                    }))
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get submission error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PATCH /api/teacher/submissions/[id] - Grade a submission
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: submissionId } = await params;
        const body = await req.json();
        const { score, bandScore, feedback, criteriaScores, isDraft } = body;

        // Verify submission — ownership via submission → assignment → classSession → course → teacherId
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    classSession: {
                        course: { teacherId: teacherProfileId }
                    }
                }
            },
            select: {
                assignmentId: true,
                studentId: true,
                assignment: { select: { title: true } }
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "Submission not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Get student user ID for notification before transaction
        const studentUser = await prisma.studentProfile.findUnique({
            where: { id: submission.studentId },
            select: { userId: true }
        });

        // Use transaction to update submission and criteria scores atomically
        const updatedSubmission = await prisma.$transaction(async (tx) => {
            const isDraftWrite = isDraft === true;
            const result = await tx.assignmentSubmission.updateMany({
                where: {
                    id: submissionId,
                    status: isDraftWrite ? { notIn: [SubmissionStatus.GRADED, SubmissionStatus.RETURNED] } : undefined
                },
                data: {
                    score,
                    bandScore,
                    feedback,
                    status: isDraftWrite ? undefined : SubmissionStatus.GRADED,
                    gradedById: isDraftWrite ? undefined : teacherProfileId,
                    gradedAt: isDraftWrite ? undefined : new Date(),
                    updatedAt: new Date()
                }
            });
            if (result.count === 0) return null;

            if (criteriaScores && criteriaScores.length > 0) {
                for (const criteriaScore of criteriaScores) {
                    const existingScore = await tx.criterionScore.findFirst({
                        where: { submissionId, criterionId: criteriaScore.criterionId }
                    });

                    if (existingScore) {
                        await tx.criterionScore.update({
                            where: { id: existingScore.id },
                            data: { score: criteriaScore.score }
                        });
                    } else {
                        await tx.criterionScore.create({
                            data: {
                                submissionId,
                                criterionId: criteriaScore.criterionId,
                                score: criteriaScore.score
                            }
                        });
                    }
                }
            }

            const updated = await tx.assignmentSubmission.findUniqueOrThrow({
                where: { id: submissionId },
                include: {
                    criteriaScores: {
                        include: { criterion: true }
                    },
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            });

            if (!isDraftWrite && studentUser) {
                await tx.notification.create({
                    data: {
                        userId: studentUser.userId,
                        title: `Assignment graded: ${submission.assignment.title}`,
                        body: `Your submission for "${submission.assignment.title}" has been graded.${updated.bandScore !== null ? ` Band score: ${updated.bandScore}` : ""}`,
                        link: `/assignments/${submission.assignmentId}`
                    }
                });
            }

            return updated;
        });

        if (!updatedSubmission) {
            return NextResponse.json(
                { success: false, message: "Submit changes to update a published grade." },
                { status: StatusCodes.CONFLICT }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Submission graded successfully",
                data: {
                    submission: {
                        id: updatedSubmission.id,
                        status: updatedSubmission.status,
                        score: updatedSubmission.score,
                        bandScore: updatedSubmission.bandScore,
                        feedback: updatedSubmission.feedback,
                        gradedAt: updatedSubmission.gradedAt?.toISOString()
                    },
                    student: {
                        id: updatedSubmission.student.id,
                        firstName: updatedSubmission.student.user.firstName,
                        lastName: updatedSubmission.student.user.lastName
                    },
                    criteriaScores: updatedSubmission.criteriaScores.map((cs) => ({
                        criterionId: cs.criterionId,
                        criterionName: cs.criterion.name,
                        maxScore: cs.criterion.maxScore,
                        score: cs.score
                    }))
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Grade submission error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
