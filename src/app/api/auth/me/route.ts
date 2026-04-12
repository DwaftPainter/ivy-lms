import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";

/**
 * @swagger
 * /api/auth/me:
 * get:
 * summary: Get current user information
 * description: Validates the JWT token from cookies and returns the user's profile data.
 * tags:
 * - Authentication
 * responses:
 * 200:
 * description: User information retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * example: true
 * message:
 * type: string
 * example: "User info fetched successfully"
 * data:
 * $ref: '#/components/schemas/User'
 * timestamp:
 * type: string
 * format: date-time
 * 302:
 * description: Redirect to login (Token missing or invalid)
 * 500:
 * description: Internal server error
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: "Internal Server Error"
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token");

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;

        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: MESSAGES.user.userNotFound },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        return NextResponse.json(
            { success: true, message: MESSAGES.auth.getInfoSuccess, data: user, timestamp: new Date() },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
