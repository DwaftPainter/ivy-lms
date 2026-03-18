import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";

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
