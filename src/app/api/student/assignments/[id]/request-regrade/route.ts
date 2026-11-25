import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-fetch";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";

// POST /api/student/assignments/[id]/request-regrade - Request teacher regrade
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
            }
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: "No submission found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        // Update submission to mark regrade requested
        await prisma.assignmentSubmission.update({
            where: { id: submission.id },
            data: {
                teacherRegradeRequested: true,
                regradeRequestedAt: new Date()
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Teacher regrade requested successfully",
                data: {
                    teacherRegradeRequested: true,
                    regradeRequestedAt: new Date().toISOString()
                }
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Request regrade error:", error);
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) || MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
