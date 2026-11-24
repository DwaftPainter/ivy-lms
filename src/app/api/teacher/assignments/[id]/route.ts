import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role, SubmissionStatus } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/assignments/{id}:
 *   get:
 *     summary: Get assignment details
 *     description: Returns detailed information about a specific assignment
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
 *         description: Assignment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an assignment
 *     description: Updates an existing assignment
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               skill:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               maxScore:
 *                 type: number
 *               instructions:
 *                 type: string
 *               attachmentUrl:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *               rubric:
 *                 type: object
 *                 properties:
 *                   criteria:
 *                     type: array
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Partial update of an assignment
 *     description: Partially updates an assignment (publish/unpublish, etc.)
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete an assignment
 *     description: Deletes an assignment and all related submissions
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
 *         description: Assignment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/assignments/[id] - Get assignment details
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

        // Get assignment with ownership verification
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
                                id: true,
                                title: true,
                                skill: true,
                                level: true
                            }
                        }
                    }
                },
                rubric: {
                    include: {
                        criteria: true
                    }
                },
                submissions: {
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
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Calculate submission stats
        const submissionStats = {
            total: assignment._count.submissions,
            pending: assignment.submissions.filter(
                (s) => s.status === SubmissionStatus.PENDING
            ).length,
            submitted: assignment.submissions.filter(
                (s) => s.status === SubmissionStatus.SUBMITTED
            ).length,
            graded: assignment.submissions.filter(
                (s) => s.status === SubmissionStatus.GRADED || s.status === SubmissionStatus.RETURNED
            ).length,
            averageScore:
                assignment.submissions.filter((s) => s.score !== null).length > 0
                    ? assignment.submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                      assignment.submissions.filter((s) => s.score !== null).length
                    : null
        };

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: assignment.id,
                    title: assignment.title,
                    description: assignment.description,
                    type: assignment.type,
                    skill: assignment.skill,
                    dueDate: assignment.dueDate?.toISOString() || null,
                    maxScore: assignment.maxScore,
                    instructions: assignment.instructions,
                    attachmentUrl: assignment.attachmentUrl,
                    isPublished: assignment.isPublished,
                    content: assignment.content,
                    classSession: assignment.classSession,
                    course: assignment.classSession?.course || null,
                    rubric: assignment.rubric,
                    submissions: assignment.submissions.map((sub) => ({
                        id: sub.id,
                        student: {
                            id: sub.student.id,
                            firstName: sub.student.user.firstName,
                            lastName: sub.student.user.lastName,
                            email: sub.student.user.email,
                            avatarUrl: sub.student.user.avatarUrl
                        },
                        status: sub.status,
                        score: sub.score,
                        bandScore: sub.bandScore,
                        submittedAt: sub.submittedAt?.toISOString() || null,
                        gradedAt: sub.gradedAt?.toISOString() || null
                    })),
                    submissionStats,
                    createdAt: assignment.createdAt.toISOString(),
                    updatedAt: assignment.updatedAt.toISOString()
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get assignment details error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PUT /api/teacher/assignments/[id] - Update an assignment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: assignmentId } = await params;
        const body = await req.json();
        const {
            title,
            description,
            type,
            skill,
            dueDate,
            maxScore,
            instructions,
            attachmentUrl,
            isPublished,
            rubric,
            content
        } = body;

        // Verify assignment exists and belongs to this teacher
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                classSession: {
                    course: { teacherId: teacherProfileId }
                }
            },
            include: { rubric: { include: { criteria: true } } }
        });

        if (!existingAssignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Update assignment in transaction
        await prisma.$transaction(async (tx) => {
            // Update assignment fields
            const assignment = await tx.assignment.update({
                where: { id: assignmentId },
                data: {
                    title: title ?? undefined,
                    description: description !== undefined ? description : undefined,
                    type: type ?? undefined,
                    skill: skill ?? undefined,
                    dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
                    maxScore: maxScore ?? undefined,
                    instructions: instructions !== undefined ? instructions : undefined,
                    attachmentUrl: attachmentUrl !== undefined ? attachmentUrl : undefined,
                    isPublished: isPublished !== undefined ? isPublished : undefined,
                    content: content !== undefined ? content : undefined
                }
            });

            // Update rubric if provided
            if (rubric?.criteria) {
                // Get existing rubric or create new one
                let rubricId = existingAssignment.rubric?.id;

                if (!rubricId) {
                    const newRubric = await tx.rubric.create({
                        data: { assignmentId }
                    });
                    rubricId = newRubric.id;
                }

                // Delete existing criteria and create new ones
                await tx.rubricCriterion.deleteMany({
                    where: { rubricId }
                });

                await tx.rubricCriterion.createMany({
                    data: rubric.criteria.map((criterion: any) => ({
                        rubricId,
                        name: criterion.name,
                        description: criterion.description,
                        maxScore: criterion.maxScore
                    }))
                });
            }

            return assignment;
        });

        // Get complete updated assignment
        const completeAssignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                classSession: {
                    select: {
                        id: true,
                        title: true,
                        course: { select: { id: true, title: true } }
                    }
                },
                rubric: { include: { criteria: true } },
                _count: { select: { submissions: true } }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment updated successfully",
                data: { assignment: completeAssignment }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Update assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PATCH /api/teacher/assignments/[id] - Partial update (e.g., publish/unpublish)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: assignmentId } = await params;
        const body = await req.json();

        // Verify assignment exists and belongs to this teacher
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                classSession: {
                    course: { teacherId: teacherProfileId }
                }
            },
            include: {
                classSession: {
                    include: {
                        enrollments: {
                            include: { student: { include: { user: { select: { id: true } } } } }
                        }
                    }
                }
            }
        });

        if (!existingAssignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Update only provided fields
        const updateData: any = {};
        if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (body.maxScore !== undefined) updateData.maxScore = body.maxScore;
        if (body.instructions !== undefined) updateData.instructions = body.instructions;
        if (body.attachmentUrl !== undefined) updateData.attachmentUrl = body.attachmentUrl;

        const updatedAssignment = await prisma.assignment.update({
            where: { id: assignmentId },
            data: updateData
        });

        // If publishing, notify enrolled students
        if (body.isPublished === true && !existingAssignment.isPublished && existingAssignment.classSession) {
            const enrollments = existingAssignment.classSession.enrollments;
            if (enrollments.length > 0) {
                const notifications = enrollments.map((enrollment) => ({
                    userId: enrollment.student.user.id,
                    title: "New Assignment Available",
                    body: `A new assignment "${updatedAssignment.title}" has been published`,
                    link: `/assignments/${assignmentId}`
                }));

                await prisma.notification.createMany({
                    data: notifications
                });
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Assignment updated successfully",
                data: {
                    assignment: {
                        id: updatedAssignment.id,
                        title: updatedAssignment.title,
                        isPublished: updatedAssignment.isPublished,
                        updatedAt: updatedAssignment.updatedAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Patch assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/teacher/assignments/[id] - Delete an assignment
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

        const { id: assignmentId } = await params;

        // Verify assignment exists and belongs to this teacher
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId,
                classSession: {
                    course: { teacherId: teacherProfileId }
                }
            }
        });

        if (!existingAssignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Delete assignment (cascade will handle related records based on schema)
        await prisma.assignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment deleted successfully"
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Delete assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
