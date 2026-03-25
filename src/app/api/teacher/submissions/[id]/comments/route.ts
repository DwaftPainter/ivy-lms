import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/submissions/{id}/comments:
 *   get:
 *     summary: Get all comments for a submission
 *     description: Returns all comments on a specific submission
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
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Add a comment to a submission
 *     description: Adds a feedback comment to a student submission
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
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/submissions/[id]/comments - Get all comments for a submission
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true
            }
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

        // Verify the submission exists and belongs to this teacher
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    course: {
                        teacherId: teacherProfileId
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

        // Get comments
        const comments = await prisma.submissionComment.findMany({
            where: { submissionId },
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
        });

        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            author: `${comment.author.firstName} ${comment.author.lastName}`,
            role: comment.author.role,
            avatarUrl: comment.author.avatarUrl,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString()
        }));

        return NextResponse.json(
            {
                success: true,
                data: { comments: formattedComments }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get comments error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teacher/submissions/[id]/comments - Add a comment to a submission
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: true
            }
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
        const { content } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Comment content is required" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify the submission exists and belongs to this teacher
        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                id: submissionId,
                assignment: {
                    course: {
                        teacherId: teacherProfileId
                    }
                }
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: { id: true }
                        }
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

        // Create the comment
        const comment = await prisma.submissionComment.create({
            data: {
                submissionId,
                authorId: userId,
                content: content.trim()
            },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Create notification for the student
        await prisma.notification.create({
            data: {
                userId: submission.student.user.id,
                title: "New Feedback on Assignment",
                body: `Your teacher ${user.firstName} ${user.lastName} left feedback on your submission`,
                link: `/assignments/${submission.assignmentId}`
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Comment added successfully",
                data: {
                    comment: {
                        id: comment.id,
                        content: comment.content,
                        author: `${comment.author.firstName} ${comment.author.lastName}`,
                        role: comment.author.role,
                        avatarUrl: comment.author.avatarUrl,
                        createdAt: comment.createdAt.toISOString(),
                        updatedAt: comment.updatedAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Add comment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
