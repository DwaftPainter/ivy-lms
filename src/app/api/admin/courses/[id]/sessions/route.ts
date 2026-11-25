import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { Role } from "@/generated/prisma/enums";

// GET /api/admin/courses/[id]/sessions - Get all class sessions for a course (admin only)
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

        const { id: courseId } = await params;

        // Verify the course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return NextResponse.json(
                { success: false, message: "Course not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const classSessions = await prisma.classSession.findMany({
            where: { courseId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        skill: true
                    }
                },
                _count: {
                    select: {
                        attendances: true,
                        assignments: true,
                        materials: true
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
            enrolledStudents: session._count.attendances,
            assignmentsCount: session._count.assignments,
            materialsCount: session._count.materials,
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
        console.error("Get course class sessions error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
