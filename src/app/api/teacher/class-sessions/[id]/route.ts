import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { AttendanceStatus, Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/class-sessions/{id}:
 *   get:
 *     summary: Get a specific class session
 *     description: Returns detailed information about a class session
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
 *         description: Class Session ID
 *     responses:
 *       200:
 *         description: Class session retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update a class session
 *     description: Updates an existing class session
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
 *         description: Class Session ID
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
 *               skill:
 *                 type: string
 *                 enum: [LISTENING, READING, WRITING, SPEAKING]
 *               sessionType:
 *                 type: string
 *                 enum: [LIVE, RECORDED, WORKSHOP]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               durationMins:
 *                 type: integer
 *               meetingUrl:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Class session updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a class session
 *     description: Deletes a class session and its associated attendance records
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
 *         description: Class Session ID
 *     responses:
 *       200:
 *         description: Class session deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/class-sessions/[id] - Get a specific class session
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

        // Get user with teacher profile
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

        const { id: sessionId } = await params;

        // Get class session
        const classSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true,
                        level: true
                    }
                },
                materials: {
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                assignments: {
                    orderBy: {
                        dueDate: "asc"
                    }
                },
                attendances: {
                    include: {
                        enrollment: {
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
                            }
                        }
                    }
                }
            }
        });

        if (!classSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Format attendance data
        const formattedAttendances = classSession.attendances.map((attendance) => ({
            id: attendance.id,
            status: attendance.status,
            attendedAt: attendance.attendedAt?.toISOString() || null,
            notes: attendance.notes,
            student: {
                id: attendance.enrollment.student.id,
                firstName: attendance.enrollment.student.user.firstName,
                lastName: attendance.enrollment.student.user.lastName,
                email: attendance.enrollment.student.user.email,
                avatarUrl: attendance.enrollment.student.user.avatarUrl
            }
        }));

        // Format materials
        const formattedMaterials = classSession.materials.map((material) => ({
            id: material.id,
            name: material.name,
            fileUrl: material.fileUrl,
            fileType: material.fileType,
            createdAt: material.createdAt.toISOString()
        }));

        // Format assignments
        const formattedAssignments = classSession.assignments.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            type: assignment.type,
            skill: assignment.skill,
            dueDate: assignment.dueDate?.toISOString() || null,
            maxScore: assignment.maxScore,
            isPublished: assignment.isPublished,
            createdAt: assignment.createdAt.toISOString()
        }));

        return NextResponse.json(
            {
                success: true,
                data: {
                    classSession: {
                        id: classSession.id,
                        title: classSession.title,
                        description: classSession.description,
                        skill: classSession.skill,
                        sessionType: classSession.sessionType,
                        scheduledDate: classSession.scheduledDate.toISOString(),
                        startTime: classSession.startTime,
                        endTime: classSession.endTime,
                        durationMins: classSession.durationMins,
                        meetingUrl: classSession.meetingUrl,
                        isPublished: classSession.isPublished,
                        course: classSession.course,
                        materials: formattedMaterials,
                        assignments: formattedAssignments,
                        attendances: formattedAttendances,
                        createdAt: classSession.createdAt.toISOString(),
                        updatedAt: classSession.updatedAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get class session error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PATCH /api/teacher/class-sessions/[id] - Update a class session
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

        // Get user with teacher profile
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

        const { id: sessionId } = await params;
        const body = await req.json();

        // Verify the class session exists and belongs to this teacher
        const existingSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            },
            include: {
                course: {
                    include: {
                        enrollments: {
                            select: {
                                id: true,
                                studentId: true
                            }
                        }
                    }
                }
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const wasPublished = existingSession.isPublished;

        // Update the class session
        const updatedSession = await prisma.classSession.update({
            where: { id: sessionId },
            data: {
                ...(body.title !== undefined && { title: body.title }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.skill !== undefined && { skill: body.skill }),
                ...(body.sessionType !== undefined && { sessionType: body.sessionType }),
                ...(body.scheduledDate !== undefined && { scheduledDate: new Date(body.scheduledDate) }),
                ...(body.startTime !== undefined && { startTime: body.startTime }),
                ...(body.endTime !== undefined && { endTime: body.endTime }),
                ...(body.durationMins !== undefined && { durationMins: body.durationMins }),
                ...(body.meetingUrl !== undefined && { meetingUrl: body.meetingUrl }),
                ...(body.isPublished !== undefined && { isPublished: body.isPublished })
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true
                    }
                },
                materials: {
                    orderBy: { createdAt: "asc" }
                },
                assignments: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        // If newly published, create attendance records
        if (body.isPublished === true && !wasPublished && existingSession.course.enrollments.length > 0) {
            const attendanceData = existingSession.course.enrollments.map((enrollment) => ({
                classSessionId: sessionId,
                enrollmentId: enrollment.id,
                status: AttendanceStatus.SCHEDULED
            }));

            await prisma.attendance.createMany({
                data: attendanceData
            });

            // Create notifications
            const notifications = existingSession.course.enrollments.map((enrollment) => ({
                userId: enrollment.studentId,
                title: "Class Published",
                body: `Class "${updatedSession.title}" is now scheduled for ${updatedSession.scheduledDate.toLocaleDateString()}`,
                link: `/classes/${sessionId}`
            }));

            await prisma.notification.createMany({
                data: notifications
            });
        }

        // Format materials and assignments for response
        const formattedMaterials = updatedSession.materials.map((material) => ({
            id: material.id,
            name: material.name,
            fileUrl: material.fileUrl,
            fileType: material.fileType,
            createdAt: material.createdAt.toISOString()
        }));

        const formattedAssignments = updatedSession.assignments.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            type: assignment.type,
            skill: assignment.skill,
            dueDate: assignment.dueDate?.toISOString() || null,
            maxScore: assignment.maxScore,
            isPublished: assignment.isPublished,
            createdAt: assignment.createdAt.toISOString()
        }));

        return NextResponse.json(
            {
                success: true,
                message: "Class session updated successfully",
                data: {
                    classSession: {
                        id: updatedSession.id,
                        title: updatedSession.title,
                        description: updatedSession.description,
                        skill: updatedSession.skill,
                        sessionType: updatedSession.sessionType,
                        scheduledDate: updatedSession.scheduledDate.toISOString(),
                        startTime: updatedSession.startTime,
                        endTime: updatedSession.endTime,
                        durationMins: updatedSession.durationMins,
                        meetingUrl: updatedSession.meetingUrl,
                        isPublished: updatedSession.isPublished,
                        course: updatedSession.course,
                        materials: formattedMaterials,
                        assignments: formattedAssignments,
                        createdAt: updatedSession.createdAt.toISOString(),
                        updatedAt: updatedSession.updatedAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Update class session error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teacher/class-sessions/[id]/materials - Add a material to the session
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        const { id: sessionId } = await params;
        const body = await req.json();
        const { name, fileUrl, fileType } = body;

        // Verify the class session exists and belongs to this teacher
        const existingSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Validate required fields
        if (!name || !fileUrl || !fileType) {
            return NextResponse.json(
                { success: false, message: "Missing required fields: name, fileUrl, fileType" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Create the material
        const material = await prisma.sessionMaterial.create({
            data: {
                sessionId,
                name,
                fileUrl,
                fileType
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Material added successfully",
                data: {
                    material: {
                        id: material.id,
                        name: material.name,
                        fileUrl: material.fileUrl,
                        fileType: material.fileType,
                        createdAt: material.createdAt.toISOString()
                    }
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Add material error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/teacher/class-sessions/[id] - Delete a class session
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Get user with teacher profile
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

        const { id: sessionId } = await params;

        // Verify the class session exists and belongs to this teacher
        const existingSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            }
        });

        if (!existingSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Delete the class session (cascade will delete attendances)
        await prisma.classSession.delete({
            where: { id: sessionId }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Class session deleted successfully"
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Delete class session error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
