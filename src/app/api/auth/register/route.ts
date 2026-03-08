import jwt from "jsonwebtoken";
import { ROLE, AUTH_PROVIDER } from "@/enums";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

export async function POST(req: Request) {
    try {
        const { email, password, firstName, lastName } = await req.json();

        const user = await prisma.user.create({
            data: {
                email,
                password,
                firstName,
                lastName,
                role: ROLE.STUDENT,
                authProvider: AUTH_PROVIDER.LOCAL
            }
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
            expiresIn: "7d"
        });

        const res = NextResponse.json({
            success: true,
            message: "Register successfully",
            status: StatusCodes.CREATED,
            data: user,
            timestamp: new Date()
        });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/"
        });

        return res;
    } catch (error: any) {
        console.log("Error: ", error);
        return new Response(error?.message ?? "Internal Server Error", { status: 500 });
    }
}
