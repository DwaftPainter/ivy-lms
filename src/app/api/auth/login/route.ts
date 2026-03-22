import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { omit } from "lodash";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { AUTH_PROVIDER } from "@/enums";
import { MESSAGES } from "@/config/message";
import { UserStatus } from "@/generated/prisma/enums";
import { MAX_ATTEMPT } from "@/constants";
import { redirectMap } from "@/config/auth/role-map";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "EMAIL_NOT_FOUND",
                        field: "email",
                        message: MESSAGES.auth.emailNotFound
                    }
                },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        if (user.authProvider === AUTH_PROVIDER.GOOGLE || !user.password) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "USE_GOOGLE_LOGIN",
                        field: "email",
                        message: MESSAGES.auth.emailLinkedGoogle
                    }
                },
                { status: StatusCodes.BAD_REQUEST }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            const newAttempts = user.failedLoginAttempts + 1;
            const remaining = MAX_ATTEMPT - newAttempts;

            if (newAttempts >= MAX_ATTEMPT) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failedLoginAttempts: newAttempts,
                        status: UserStatus.LOCKED
                    }
                });

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: "TOO_MANY_ATTEMPT",
                            field: "password",
                            message: MESSAGES.auth.tooManyAttempt
                        }
                    },
                    { status: StatusCodes.TOO_MANY_REQUESTS }
                );
            }

            // Chưa bị lock → tăng attempts
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: newAttempts
                }
            });

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "WRONG_PASSWORD",
                        field: "password",
                        message: MESSAGES.auth.wrongPasswordRemaining({
                            remaining
                        })
                    }
                },
                { status: StatusCodes.UNAUTHORIZED }
            );
        }

        const safeUser = omit(user, ["password", "createdAt", "updatedAt", "role"]);

        const res = NextResponse.json(
            {
                success: true,
                message: MESSAGES.auth.loginSuccess,
                redirectTo: redirectMap[user.role] || "/",
                data: safeUser,
                timestamp: new Date()
            },
            { status: StatusCodes.OK }
        );

        const token = jwt.sign({ userId: safeUser.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
            expiresIn: "7d"
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
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
