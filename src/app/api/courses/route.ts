import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import { CourseLevel, IeltsSkill } from "@/generated/prisma/enums";

// GET /api/courses - List all courses
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const level = searchParams.get("level") as CourseLevel | null;
        const skill = searchParams.get("skill") as IeltsSkill | null;
        const isPublished = searchParams.get("isPublished");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }
        if (level) {
            where.level = level;
        }
        if (skill) {
            where.skill = skill;
        }
        if (isPublished !== null && isPublished !== undefined) {
            where.isPublished = isPublished === "true";
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    teacher: {
                        select: {
                            id: true
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            lessons: true
                        }
                    }
                }
            }),
            prisma.course.count({ where })
        ]);

        return NextResponse.json(
            {
                success: true,
                data: courses,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get courses error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/courses - Create a new course
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            title,
            description,
            teacherId,
            thumbnailUrl,
            skill,
            level,
            targetBand,
            isPublished = false
        } = body;

        // Validation
        if (!title || !teacherId || !skill || !level) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Validate enums
        if (!Object.values(IeltsSkill).includes(skill)) {
            return NextResponse.json({ message: "Invalid skill value" }, { status: StatusCodes.BAD_REQUEST });
        }
        if (!Object.values(CourseLevel).includes(level)) {
            return NextResponse.json({ message: "Invalid level value" }, { status: StatusCodes.BAD_REQUEST });
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                teacherId,
                thumbnailUrl,
                skill,
                level,
                targetBand: targetBand ? parseFloat(targetBand) : null,
                isPublished
            },
            include: {
                teacher: {
                    select: {
                        id: true
                    }
                }
            }
        });

        return NextResponse.json(
            { success: true, data: course, message: "Course created successfully" },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Create course error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
