import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { Ollama } from "ollama";
import { z } from "zod";

const conversation = z.object({
    messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000)
    })).min(1).max(9).refine((messages) => messages.at(-1)?.role === "user")
});

export async function POST(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const secret = process.env.JWT_SECRET_KEY;
    try {
        if (!token || !secret) throw new Error("Missing session");
        jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch {
        return NextResponse.json({ message: "Sign in again to use IVY Agent." }, { status: 401 });
    }

    const payload = conversation.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
        return NextResponse.json({ message: "This message could not be sent." }, { status: 400 });
    }

    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ message: "IVY Agent is not configured yet." }, { status: 503 });
    }

    try {
        const ollama = new Ollama({
            host: "https://ollama.com",
            headers: { Authorization: `Bearer ${apiKey}` },
            fetch: (input, init) => fetch(input, {
                ...init,
                signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)])
            })
        });
        const response = await ollama.chat({
            model: process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud",
            stream: false,
            options: { num_predict: 600 },
            messages: [{
                role: "system",
                content: "You are IVY Agent, a concise IELTS study and IVY LMS help assistant. Reply in the user's language using concise plain text. Explain concepts and suggest practice. Do not answer active assessment questions or claim to access accounts, grades, submissions, or to perform actions. When uncertain about an LMS workflow, say so. Never request passwords or private student data."
            }, ...payload.data.messages]
        });
        const reply = response.message.content.trim().slice(0, 4000);
        if (!reply) throw new Error("Empty reply");
        return NextResponse.json({ reply });
    } catch {
        return NextResponse.json({ message: "IVY Agent is temporarily unavailable. Please try again." }, { status: 502 });
    }
}
