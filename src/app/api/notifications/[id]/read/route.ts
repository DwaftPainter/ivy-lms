import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read for the authenticated user
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
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

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;
        const userId = payload.userId;
        const { id } = await params;

        const notification = await prisma.notification.findFirst({
            where: { id, userId }
        });

        if (!notification) {
            return NextResponse.json(
                { success: false, message: MESSAGES.notification.notFound },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json(
            {
                success: true,
                message: MESSAGES.notification.markAsReadSuccess,
                timestamp: new Date()
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Mark notification as read error:", error);
        return NextResponse.json(
            { success: false, message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
