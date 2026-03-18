import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLE, AUTH_PROVIDER } from "@/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import { omit } from "lodash";

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName } = await req.json();

        const existingUser = await prisma.user.findFirst({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "EMAIL_ALREADY_EXISTS",
                        field: "email",
                        message: MESSAGES.auth.emailAlreadyExists
                    }
                },
                { status: StatusCodes.CONFLICT }
            );
        }

        const user = await prisma.user.create({
            data: {
                email,
                password,
                firstName,
                lastName,
                role: ROLE.STUDENT,
                authProvider: AUTH_PROVIDER.LOCAL,
                failedLoginAttempts: 0
            }
        });

        const safeUser = omit(user, ["password"]);

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
            expiresIn: "7d"
        });

        const res = NextResponse.json(
            {
                success: true,
                message: MESSAGES.auth.registerSuccess,
                data: safeUser,
                timestamp: new Date()
            },
            { status: StatusCodes.CREATED }
        );

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/"
        });

        return res;
    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: MESSAGES.common.serverError
                }
            },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
