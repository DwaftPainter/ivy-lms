import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role, AttendanceStatus } from "@/generated/prisma/enums";

// GET /api/admin/sessions/[id] - Get a specific class session (admin only)
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

        // Get user and verify admin role
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, message: "Access denied. Admins only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const { id: sessionId } = await params;

        const classSession = await prisma.classSession.findUnique({
            where: { id: sessionId },
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
                    orderBy: { createdAt: "asc" }
                },
                assignments: {
                    orderBy: { createdAt: "desc" }
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
                                                email: true
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
                { success: false, message: "Class session not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

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
                        courseId: classSession.courseId,
                        course: classSession.course,
                        materials: classSession.materials,
                        assignments: classSession.assignments,
                        attendances: classSession.attendances,
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

// PATCH /api/admin/sessions/[id] - Update a class session (admin only)
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

        // Get user and verify admin role
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, message: "Access denied. Admins only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const { id: sessionId } = await params;
        const body = await req.json();

        // Get existing session with course data
        const existingSession = await prisma.classSession.findUnique({
            where: { id: sessionId },
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
                { success: false, message: "Class session not found" },
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
                }
            }
        });

        // If newly published, create attendance records and notifications
        if (body.isPublished === true && !wasPublished && existingSession.course.enrollments.length > 0) {
            const attendanceData = existingSession.course.enrollments.map((enrollment) => ({
                classSessionId: sessionId,
                enrollmentId: enrollment.id,
                status: AttendanceStatus.SCHEDULED
            }));

            await prisma.attendance.createMany({
                data: attendanceData
            });

            // Create notifications for enrolled students
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
                        courseId: updatedSession.courseId,
                        course: updatedSession.course
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

// DELETE /api/admin/sessions/[id] - Delete a class session (admin only)
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

        // Get user and verify admin role
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, message: "Access denied. Admins only." },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const { id: sessionId } = await params;

        // Verify the class session exists
        const existingSession = await prisma.classSession.findUnique({
            where: { id: sessionId }
        });

        if (!existingSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Delete the class session (cascade will delete attendances, materials, etc.)
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
