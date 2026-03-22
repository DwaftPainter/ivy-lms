import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { redirectMap } from "./config/auth/role-map";

export function proxy(req: NextRequest) {
    const token = req.cookies.get("token");
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const payload = jwt.verify(token.value, process.env.JWT_SECRET_KEY!) as any;

        const { role } = payload;

        const redirectByRole = redirectMap[role] || "/login";

        if (pathname === "/") {
            return NextResponse.redirect(new URL(redirectByRole, req.url));
        }

        if ((pathname.startsWith("/admin") || pathname.startsWith("/api-doc")) && role !== "ADMIN") {
            return NextResponse.redirect(new URL(redirectByRole, req.url));
        }

        if (pathname.startsWith("/teacher") && role !== "TEACHER") {
            return NextResponse.redirect(new URL(redirectByRole, req.url));
        }

        const studentRoutes = ["/dashboard", "/courses", "/schedule", "/extension", "/settings"];

        const isAccessingStudentRoute = studentRoutes.some((route) => pathname.startsWith(route));

        if (isAccessingStudentRoute && role !== "STUDENT") {
            return NextResponse.redirect(new URL(redirectByRole, req.url));
        }

        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/",
        "/admin/:path*",
        "/teacher/:path*",
        "/dashboard/:path*",
        "/courses/:path*",
        "/schedule/:path*",
        "/extension/:path*",
        "/settings/:path*",
        "/api-doc/:path*"
    ]
};
