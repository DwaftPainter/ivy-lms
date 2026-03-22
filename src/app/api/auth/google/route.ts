import { redirectMap } from "@/config/auth/role-map";
import { MESSAGES } from "@/config/message";
import { AUTH_PROVIDER, ROLE } from "@/enums";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { omit } from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        let user = await prisma.user.findUnique({
            where: { email: payload.email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    ...payload,
                    role: ROLE.STUDENT,
                    authProvider: AUTH_PROVIDER.GOOGLE
                }
            });
        }

        const safeUser = omit(user, ["password", "role", "createdAt", "updatedAt"]);

        const token = jwt.sign({ userId: safeUser.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
            expiresIn: "7d"
        });

        const res = NextResponse.json({
            success: true,
            message: MESSAGES.auth.loginSuccess,
            redirectTo: redirectMap[user.role] || "/",
            data: safeUser,
            timestamp: new Date()
        });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/"
        });

        return res;
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { message: "Internal server error" },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
