import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { MESSAGES } from "@/config/message";
import bcrypt from "bcrypt";
import { ROLE, AUTH_PROVIDER } from "@/enums";
import { generateTemporaryPassword } from "@/lib/utils";

// GET /api/teachers - List all teachers
export async function GET() {
    try {
        const teachers = await prisma.user.findMany({
            where: {
                role: ROLE.TEACHER
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                teacherProfile: {
                    select: {
                        bio: true,
                        expertise: true
                    }
                }
            },
            orderBy: {
                firstName: "asc"
            }
        });

        return NextResponse.json(
            {
                success: true,
                data: teachers
            },
            { status: StatusCodes.OK }
        );
    } catch (error) {
        console.error("Get teachers error:", error);
        return NextResponse.json(
            { message: MESSAGES.common.serverError },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}

// POST /api/teachers - Create a new teacher user
export async function POST(req: Request) {
    try {
        const { email, firstName, lastName, bio, expertise } = await req.json();

        // Check if user already exists
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

        // Generate temporary password
        const tempPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create user with teacher role
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: ROLE.TEACHER,
                authProvider: AUTH_PROVIDER.LOCAL,
                failedLoginAttempts: 0
            }
        });

        // Create teacher profile
        await prisma.teacherProfile.create({
            data: {
                userId: user.id,
                bio: bio || null,
                expertise: expertise || []
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: MESSAGES.teacher.createSuccess,
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    temporaryPassword: tempPassword
                }
            },
            { status: StatusCodes.CREATED }
        );
    } catch (error) {
        console.error("Create teacher error:", error);
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
