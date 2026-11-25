import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@/types/common";

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     description: Returns all notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       isRead:
 *                         type: boolean
 *                       link:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit
        });

        return NextResponse.json(
            {
                success: true,
                message: MESSAGES.notification.fetchSuccess,
                data: notifications,
                timestamp: new Date()
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get notifications error:", error);
        return NextResponse.json(
            { success: false, message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     description: Creates a new notification (for server use)
 *     tags:
 *       - Notifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, title, body: notificationBody, link } = body;

        if (!userId || !title || !notificationBody) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                body: notificationBody,
                link
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: "Notification created successfully",
                data: notification,
                timestamp: new Date()
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Create notification error:", error);
        return NextResponse.json(
            { success: false, message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
