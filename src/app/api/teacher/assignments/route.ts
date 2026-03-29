import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role, IeltsSkill, AssignmentType } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/assignments:
 *   get:
 *     summary: Get all assignments for the teacher
 *     description: Returns all assignments created by the teacher across their courses
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
 *         name: classSessionId
 *         schema:
 *           type: string
 *         description: Filter by class session ID
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *           enum: [LISTENING, READING, WRITING, SPEAKING]
 *         description: Filter by IELTS skill
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new assignment
 *     description: Creates a new assignment for a class session
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
 *             required:
 *               - classSessionId
 *               - title
 *               - type
 *               - skill
 *             properties:
 *               classSessionId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [WRITING_TASK1, WRITING_TASK2, SPEAKING, LISTENING, READING, MOCK_TEST]
 *               skill:
 *                 type: string
 *                 enum: [LISTENING, READING, WRITING, SPEAKING]
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
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         maxScore:
 *                           type: number
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Class session not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/assignments - Get all assignments for the teacher
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

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        const classSessionId = searchParams.get("classSessionId");
        const skill = searchParams.get("skill") as IeltsSkill | null;

        // Build where clause
        const whereClause: any = {
            classSession: {
                course: { teacherId: teacherProfileId }
            }
        };

        if (courseId) {
            whereClause.classSession.courseId = courseId;
        }

        if (classSessionId) {
            whereClause.classSessionId = classSessionId;
        }

        if (skill) {
            whereClause.skill = skill;
        }

        // Get assignments
        const assignments = await prisma.assignment.findMany({
            where: whereClause,
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
                                skill: true
                            }
                        }
                    }
                },
                _count: {
                    select: { submissions: true }
                },
                rubric: {
                    include: {
                        criteria: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Format assignments
        const formattedAssignments = assignments.map((assignment) => ({
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
            classSession: assignment.classSession,
            course: assignment.classSession.course,
            submissionCount: assignment._count.submissions,
            rubric: assignment.rubric,
            createdAt: assignment.createdAt.toISOString(),
            updatedAt: assignment.updatedAt.toISOString()
        }));

        // Calculate stats
        const stats = {
            total: assignments.length,
            published: assignments.filter((a) => a.isPublished).length,
            draft: assignments.filter((a) => !a.isPublished).length,
            bySkill: {
                LISTENING: assignments.filter((a) => a.skill === IeltsSkill.LISTENING).length,
                READING: assignments.filter((a) => a.skill === IeltsSkill.READING).length,
                WRITING: assignments.filter((a) => a.skill === IeltsSkill.WRITING).length,
                SPEAKING: assignments.filter((a) => a.skill === IeltsSkill.SPEAKING).length
            }
        };

        return NextResponse.json(
            {
                success: true,
                data: {
                    assignments: formattedAssignments,
                    stats
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get teacher assignments error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teacher/assignments - Create a new assignment
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

        const body = await req.json();
        const {
            classSessionId,
            title,
            description,
            type,
            skill,
            dueDate,
            maxScore = 9.0,
            instructions,
            attachmentUrl,
            isPublished = false,
            rubric
        } = body;

        // Validate required fields
        if (!classSessionId || !title || !type || !skill) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: classSessionId, title, type, skill"
                },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify the class session exists and belongs to this teacher
        const classSession = await prisma.classSession.findFirst({
            where: {
                id: classSessionId,
                course: { teacherId: teacherProfileId }
            }
        });

        if (!classSession) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Create assignment with optional rubric in a transaction
        const assignment = await prisma.$transaction(async (tx) => {
            // Create the assignment
            const newAssignment = await tx.assignment.create({
                data: {
                    classSessionId,
                    title,
                    description,
                    type,
                    skill,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    maxScore,
                    instructions,
                    attachmentUrl,
                    isPublished
                }
            });

            // Create rubric if provided
            if (rubric?.criteria && rubric.criteria.length > 0) {
                const createdRubric = await tx.rubric.create({
                    data: {
                        assignmentId: newAssignment.id
                    }
                });

                await tx.rubricCriterion.createMany({
                    data: rubric.criteria.map((criterion: any) => ({
                        rubricId: createdRubric.id,
                        name: criterion.name,
                        description: criterion.description,
                        maxScore: criterion.maxScore
                    }))
                });
            }

            return newAssignment;
        });

        // Get the complete assignment with relations
        const completeAssignment = await prisma.assignment.findUnique({
            where: { id: assignment.id },
            include: {
                classSession: {
                    select: {
                        id: true,
                        title: true,
                        course: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                },
                rubric: {
                    include: { criteria: true }
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment created successfully",
                data: {
                    assignment: completeAssignment
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Create assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
