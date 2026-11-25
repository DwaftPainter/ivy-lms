import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role, AttendanceStatus } from "@/generated/prisma/enums";

// GET /api/admin/sessions - Get all class sessions (admin only)
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

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        const whereClause: any = {};
        if (courseId) {
            whereClause.courseId = courseId;
        }

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
                teacher: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
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
            courseId: session.courseId,
            course: session.course,
            teacher: session.teacher.user,
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

// POST /api/admin/sessions - Create a new class session (admin only)
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

        // Verify the course exists and get its teacher
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                teacher: true,
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
                { success: false, message: "Course not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Create the class session with the course's teacher
        const classSession = await prisma.classSession.create({
            data: {
                courseId,
                teacherId: course.teacherId,
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
                        courseId: classSession.courseId,
                        course: classSession.course,
                        enrolledStudents: course.enrollments.length
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
