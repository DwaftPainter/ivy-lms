import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { omit } from "lodash";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { AUTH_PROVIDER } from "@/enums";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ message: "Email not found" }, { status: StatusCodes.NOT_FOUND });
        }

        if (user.authProvider === AUTH_PROVIDER.GOOGLE || !user.password) {
            return NextResponse.json({ message: "Use google login" }, { status: StatusCodes.BAD_REQUEST });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({ message: "Wrong password" }, { status: StatusCodes.UNAUTHORIZED });
        }

        const safeUser = omit(user, ["password", "createdAt", "updatedAt"]);

        const res = NextResponse.json(
            {
                success: true,
                data: safeUser
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
            { message: "Internal server error" },
            { status: StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
}
