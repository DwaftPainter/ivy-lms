import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import { CourseLevel, IeltsSkill } from "@/generated/prisma/enums";

// GET /api/courses/[id] - Get a single course
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                teacher: {
                    select: {
                        id: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        if (!course) {
            return NextResponse.json({ message: "Course not found" }, { status: StatusCodes.NOT_FOUND });
        }

        return NextResponse.json({ success: true, data: course }, { status: StatusCodes.OK });
    } catch (error) {
        console.error("Get course error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, teacherId, thumbnailUrl, skill, level, targetBand, isPublished } =
            body;

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id }
        });

        if (!existingCourse) {
            return NextResponse.json({ message: "Course not found" }, { status: StatusCodes.NOT_FOUND });
        }

        // Validate enums if provided
        if (skill && !Object.values(IeltsSkill).includes(skill)) {
            return NextResponse.json({ message: "Invalid skill value" }, { status: StatusCodes.BAD_REQUEST });
        }
        if (level && !Object.values(CourseLevel).includes(level)) {
            return NextResponse.json({ message: "Invalid level value" }, { status: StatusCodes.BAD_REQUEST });
        }

        const updateData: Prisma.CourseUncheckedUpdateInput = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (teacherId !== undefined) updateData.teacherId = teacherId;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
        if (skill !== undefined) updateData.skill = skill;
        if (level !== undefined) updateData.level = level;
        if (targetBand !== undefined) updateData.targetBand = parseFloat(targetBand);
        if (isPublished !== undefined) updateData.isPublished = isPublished;

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                teacher: {
                    select: {
                        id: true
                    }
                }
            }
        });

        return NextResponse.json(
            { success: true, data: course, message: "Course updated successfully" },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Update course error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id }
        });

        if (!existingCourse) {
            return NextResponse.json({ message: "Course not found" }, { status: StatusCodes.NOT_FOUND });
        }

        await prisma.course.delete({
            where: { id }
        });

        return NextResponse.json(
            { success: true, message: "Course deleted successfully" },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Delete course error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
