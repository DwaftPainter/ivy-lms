import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role, AttendanceStatus } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/class-sessions:
 *   get:
 *     summary: Get all class sessions for the teacher
 *     description: Returns all class sessions scheduled by the logged-in teacher
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Get only upcoming sessions
 *     responses:
 *       200:
 *         description: Class sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new class session
 *     description: Creates a new class session for a course
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skill:
 *                 type: string
 *                 enum: [LISTENING, READING, WRITING, SPEAKING]
 *               sessionType:
 *                 type: string
 *                 default: LIVE
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
 *     responses:
 *       201:
 *         description: Class session created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/class-sessions - Get all class sessions
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

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const upcomingOnly = searchParams.get("upcoming") === "true";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Build query
        const whereClause: any = {
            teacherId: teacherProfileId
        };

        if (courseId) {
            whereClause.courseId = courseId;
        }

        if (upcomingOnly) {
            whereClause.scheduledDate = {
                gte: today
            };
        }

        // Get class sessions
        const classSessions = await prisma.classSession.findMany({
            where: whereClause,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true,
                        level: true
                    }
                },
                _count: {
                    select: {
                        attendances: true
                    }
                }
            },
            orderBy: {
                scheduledDate: "asc"
            }
        });

        const formattedSessions = classSessions.map((session) => ({
            id: session.id,
            title: session.title,
            description: session.description,
            skill: session.skill,
            sessionType: session.sessionType,
            scheduledDate: session.scheduledDate.toISOString(),
            startTime: session.startTime,
            endTime: session.endTime,
            durationMins: session.durationMins,
            meetingUrl: session.meetingUrl,
            isPublished: session.isPublished,
            course: session.course,
            enrolledStudents: session._count.attendances,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString()
        }));

        return NextResponse.json(
            {
                success: true,
                data: { classSessions: formattedSessions }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get class sessions error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teacher/class-sessions - Create a new class session
export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const {
            courseId,
            title,
            description,
            skill,
            sessionType = "LIVE",
            scheduledDate,
            startTime,
            endTime,
            durationMins = 60,
            meetingUrl,
            isPublished = false
        } = body;

        // Validate required fields
        if (!courseId || !title || !scheduledDate || !startTime || !endTime) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: courseId, title, scheduledDate, startTime, endTime"
                },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify the course exists and belongs to this teacher
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                teacherId: teacherProfileId
            },
            include: {
                enrollments: {
                    select: {
                        id: true,
                        studentId: true
                    }
                }
            }
        });

        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Create the class session
        const classSession = await prisma.classSession.create({
            data: {
                courseId,
                teacherId: teacherProfileId,
                title,
                description,
                skill: skill || course.skill,
                sessionType,
                scheduledDate: new Date(scheduledDate),
                startTime,
                endTime,
                durationMins,
                meetingUrl,
                isPublished
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

        // If published, create attendance records for all enrolled students
        if (isPublished && course.enrollments.length > 0) {
            const attendanceData = course.enrollments.map((enrollment) => ({
                classSessionId: classSession.id,
                enrollmentId: enrollment.id,
                status: AttendanceStatus.SCHEDULED
            }));

            await prisma.attendance.createMany({
                data: attendanceData
            });

            // Create notifications for enrolled students
            const notifications = course.enrollments.map((enrollment) => ({
                userId: enrollment.studentId,
                title: "New Class Scheduled",
                body: `A new class "${title}" has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
                link: `/classes/${classSession.id}`
            }));

            await prisma.notification.createMany({
                data: notifications
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Class session created successfully",
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
                        course: classSession.course
                    }
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Create class session error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
