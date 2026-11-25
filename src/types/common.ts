import type { Role } from "@/generated/prisma/enums";

export type AuthTokenPayload = {
    userId: string;
    role: Role;
};

export type ApiResponse<T> = {
    success: boolean,
    message: string,
    redirectTo?: string,
    data: T,
    timestamp: string
}
