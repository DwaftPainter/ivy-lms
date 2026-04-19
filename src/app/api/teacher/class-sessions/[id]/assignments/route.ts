import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import { Role } from "@/generated/prisma/enums";

/**
 * @swagger
 * /api/teacher/class-sessions/{id}/assignments:
 *   get:
 *     summary: Get available assignments for linking
 *     description: Returns assignments that can be linked to this session (same course/skill)
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
 *         description: Assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Link an assignment to the session
 *     description: Links an existing assignment to this class session
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
 *               assignmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment linked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session or assignment not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Unlink an assignment from the session
 *     description: Unlinks an assignment from this class session
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
 *               assignmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment unlinked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session or assignment not found
 *       500:
 *         description: Internal server error
 */

// GET /api/teacher/class-sessions/[id]/assignments - Get available assignments for linking
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

        // Get the session to find the course
        const session = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            },
            include: {
                course: true,
                assignments: {
                    select: { id: true }
                }
            }
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Get already linked assignment IDs
        const linkedIds = session.assignments.map((a) => a.id);

        // Get available assignments from the same course or with the same skill
        // Get all assignments with this skill, excluding already linked ones
        const availableAssignments = await prisma.assignment.findMany({
            where: {
                skill: session.skill,
                ...(linkedIds.length > 0 ? { id: { notIn: linkedIds } } : {})
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });

        // Also get assignments from other sessions of the same course
        const courseAssignments = await prisma.assignment.findMany({
            where: {
                classSession: {
                    courseId: session.courseId
                },
                id: { notIn: [...linkedIds, ...availableAssignments.map((a) => a.id)] }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        });

        const allAssignments = [...availableAssignments, ...courseAssignments];

        const formattedAssignments = allAssignments.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            type: assignment.type,
            skill: assignment.skill,
            dueDate: assignment.dueDate?.toISOString() || null,
            maxScore: assignment.maxScore,
            isPublished: assignment.isPublished
        }));

        return NextResponse.json(
            {
                success: true,
                data: { assignments: formattedAssignments }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get available assignments error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teacher/class-sessions/[id]/assignments - Link an assignment to session
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
        const { assignmentId } = body;

        if (!assignmentId) {
            return NextResponse.json(
                { success: false, message: "Missing required field: assignmentId" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify the session belongs to this teacher
        const session = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            }
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Update the assignment to link it to this session
        const updatedAssignment = await prisma.assignment.update({
            where: { id: assignmentId },
            data: { classSessionId: sessionId }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment linked successfully",
                data: {
                    assignment: {
                        id: updatedAssignment.id,
                        title: updatedAssignment.title,
                        type: updatedAssignment.type,
                        skill: updatedAssignment.skill,
                        dueDate: updatedAssignment.dueDate?.toISOString() || null
                    }
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Link assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// DELETE /api/teacher/class-sessions/[id]/assignments - Unlink an assignment from session
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        const { assignmentId } = body;

        if (!assignmentId) {
            return NextResponse.json(
                { success: false, message: "Missing required field: assignmentId" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify the session and assignment belong to this teacher
        const session = await prisma.classSession.findFirst({
            where: {
                id: sessionId,
                teacherId: teacherProfileId
            },
            include: {
                assignments: {
                    where: { id: assignmentId }
                }
            }
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Class session not found or access denied" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        if (!session?.assignments?.length) {
            return NextResponse.json(
                { success: false, message: "Assignment not linked to this session" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Unlink the assignment by setting classSessionId to null
        await prisma.assignment.update({
            where: { id: assignmentId },
            data: { classSessionId: null }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment unlinked successfully"
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Unlink assignment error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
