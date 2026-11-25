import jwt from "jsonwebtoken";
import { ROLE, AUTH_PROVIDER } from "@/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import { omit } from "lodash";
import { redirectMap } from "@/config/auth/role-map";

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new student
 * description: Creates a new user account with the ROLE.STUDENT, initializes a student profile, and sets an auth cookie.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * example: user@example.com
 * password:
 * type: string
 * format: password
 * example: "StrongPassword123!"
 * firstName:
 * type: string
 * example: John
 * lastName:
 * type: string
 * example: Doe
 * responses:
 * 201:
 * description: User registered successfully. Returns user data and sets 'token' cookie.
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
 * data:
 * $ref: '#/components/schemas/User'
 * timestamp:
 * type: string
 * format: date-time
 * 409:
 * description: Conflict - Email already exists.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * 500:
 * description: Internal Server Error.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 */
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

        await prisma.studentProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id
            }
        });

        const safeUser = omit(user, ["password", "role"]);

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
            expiresIn: "7d"
        });

        const res = NextResponse.json(
            {
                success: true,
                message: MESSAGES.auth.registerSuccess,
                redirectTo: redirectMap[user.role] || "/",
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
