import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/submissions/{id}/draft:
 *   post:
 *     summary: Save a draft grade
 *     description: Saves grading progress as a draft without finalizing the grade
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
 *                 description: Raw score
 *               bandScore:
 *                 type: number
 *                 description: IELTS band score 0-9
 *               feedback:
 *                 type: string
 *                 description: Teacher feedback
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
 *         description: Draft saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Clear draft grades
 *     description: Removes all draft data for a submission
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
 *         description: Draft cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 */

// POST /api/teacher/submissions/[id]/draft - Save draft grade
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        const { score, bandScore, feedback, criteriaScores } = body;

        // Verify submission ownership
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
                        rubric: { include: { criteria: true } }
                    }
                }
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "Submission not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Use transaction to update criteria scores only (preserve status)
        await prisma.$transaction(async (tx) => {
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

            // Update score fields WITHOUT changing status (draft save)
            return tx.assignmentSubmission.update({
                where: { id: submissionId },
                data: {
                    score: score ?? null,
                    bandScore: bandScore ?? null,
                    feedback: feedback ?? null
                    // Note: status, gradedById, gradedAt are NOT updated
                },
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
        });

        return NextResponse.json(
            {
                success: true,
                message: "Draft saved successfully",
                data: {
                    submissionId,
                    score,
                    bandScore,
                    feedback,
                    isDraft: true
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Save draft error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/teacher/submissions/[id]/draft - Clear draft (reset scores)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Verify submission ownership
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    classSession: {
                        course: { teacherId: teacherProfileId }
                    }
                }
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "Submission not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Only clear draft if submission is not already graded
        if (submission.status !== "GRADED" && submission.status !== "RETURNED") {
            await prisma.$transaction(async (tx) => {
                // Delete criteria scores
                await tx.criterionScore.deleteMany({
                    where: { submissionId }
                });

                // Clear score fields but keep status
                return tx.assignmentSubmission.update({
                    where: { id: submissionId },
                    data: {
                        score: null,
                        bandScore: null,
                        feedback: null
                    }
                });
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Draft cleared successfully",
                data: { submissionId }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Clear draft error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
