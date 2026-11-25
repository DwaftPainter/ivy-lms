import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-fetch";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";
import { gradeWithOllama, AIGradingInput, AIGradingResult, AICorrection } from "@/lib/ai-grading";

// POST /api/student/assignments/[id]/ai-grade - Grade writing assignment with Ollama AI
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: assignmentId } = await params;
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as AuthTokenPayload;
        const userId = payload.userId;

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Get assignment with submission
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                classSession: {
                    select: { courseId: true }
                },
                submissions: {
                    where: { studentId: studentProfile.id },
                    take: 1
                }
            }
        });

        if (!assignment) {
            return NextResponse.json(
                { success: false, message: "Assignment not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Verify assignment has a session
        if (!assignment.classSession) {
            return NextResponse.json(
                { success: false, message: "Assignment is not linked to any session" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Verify student is enrolled
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId: studentProfile.id,
                courseId: assignment.classSession.courseId
            }
        });

        if (!enrollment) {
            return NextResponse.json(
                { success: false, message: "Not enrolled in this course" },
                { status: StatusCodes.FORBIDDEN }
            );
        }

        const submission = assignment.submissions[0];
        if (!submission || !submission.content) {
            return NextResponse.json(
                { success: false, message: "No submission found to grade" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        // Call Ollama API for grading
        const aiResult = await gradeWithOllama({
            essay: submission.content,
            assignmentType: assignment.type,
            instructions: assignment.instructions,
            description: assignment.description
        });

        // Update submission with AI grading results
        await prisma.assignmentSubmission.update({
            where: { id: submission.id },
            data: {
                aiScore: aiResult.score,
                aiFeedback: aiResult.feedback,
                aiGradedAt: new Date(),
                aiCorrections: aiResult.corrections,
                teacherRegradeRequested: false
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Assignment graded by AI",
                data: {
                    aiScore: aiResult.score,
                    aiFeedback: aiResult.feedback,
                    aiCorrections: aiResult.corrections,
                    gradedAt: new Date().toISOString()
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("AI grade assignment error:", error);
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) || MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// GET /api/student/assignments/[id]/ai-grade - Get AI grading results
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: assignmentId } = await params;
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as AuthTokenPayload;
        const userId = payload.userId;

        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId }
        });

        if (!studentProfile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        const submission = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId,
                studentId: studentProfile.id
            },
            select: {
                aiScore: true,
                aiFeedback: true,
                aiGradedAt: true,
                aiCorrections: true,
                teacherRegradeRequested: true,
                regradeRequestedAt: true,
                status: true
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "No submission found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    hasAIGrading: !!submission.aiGradedAt,
                    aiScore: submission.aiScore,
                    aiFeedback: submission.aiFeedback,
                    aiCorrections: submission.aiCorrections,
                    teacherRegradeRequested: submission.teacherRegradeRequested,
                    regradeRequestedAt: submission.regradeRequestedAt,
                    gradedAt: submission.aiGradedAt
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get AI grade error:", error);
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) || MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// Re-export for backwards compatibility
export type { AIGradingInput, AIGradingResult, AICorrection };
