import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { Role, AttendanceStatus } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/class-sessions/{id}/attendance:
 *   get:
 *     summary: Get attendance for a class session
 *     description: Returns all attendance records for a specific class session
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
 *         description: Attendance records retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update attendance records
 *     description: Updates attendance status for students in a class session
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
 *               attendances:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attendanceId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [SCHEDULED, ATTENDED, ABSENT, EXCUSED]
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/class-sessions/[id]/attendance - Get attendance for a class session
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
        const classSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            },
            include: {
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

        // Calculate attendance stats
        const totalStudents = classSession.attendances.length;
        const attendedCount = classSession.attendances.filter(
            (a) => a.status === AttendanceStatus.ATTENDED
        ).length;
        const absentCount = classSession.attendances.filter(
            (a) => a.status === AttendanceStatus.ABSENT
        ).length;
        const excusedCount = classSession.attendances.filter(
            (a) => a.status === AttendanceStatus.EXCUSED
        ).length;
        const pendingCount = classSession.attendances.filter(
            (a) => a.status === AttendanceStatus.SCHEDULED
        ).length;

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

        return NextResponse.json(
            {
                success: true,
                data: {
                    classSession: {
                        id: classSession.id,
                        title: classSession.title,
                        scheduledDate: classSession.scheduledDate.toISOString(),
                        startTime: classSession.startTime,
                        endTime: classSession.endTime
                    },
                    attendances: formattedAttendances,
                    stats: {
                        totalStudents,
                        attendedCount,
                        absentCount,
                        excusedCount,
                        pendingCount,
                        attendanceRate: totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get attendance error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PATCH /api/teacher/class-sessions/[id]/attendance - Update attendance
export async function PATCH(
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
        const { attendances } = await req.json();

        // Verify the class session exists and belongs to this teacher
        const classSession = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            }
        });

        if (!classSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Validate attendances array
        if (!Array.isArray(attendances) || attendances.length === 0) {
            return NextResponse.json(
                { success: false, message: "Attendances array is required" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Update attendance records
        const updatedAttendances = await prisma.$transaction(
            attendances.map((attendance: { attendanceId: string; status: AttendanceStatus; notes?: string }) =>
                prisma.attendance.update({
                    where: {
                        id: attendance.attendanceId,
                        classSessionId: sessionId
                    },
                    data: {
                        status: attendance.status,
                        notes: attendance.notes,
                        ...(attendance.status === AttendanceStatus.ATTENDED && { attendedAt: new Date() })
                    },
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
                })
            )
        );

        // Format the response
        const formattedAttendances = updatedAttendances.map((attendance) => ({
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

        return NextResponse.json(
            {
                success: true,
                message: "Attendance updated successfully",
                data: { attendances: formattedAttendances }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Update attendance error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
