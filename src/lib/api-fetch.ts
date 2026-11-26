export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        ...options
    });

    const data = await res.json();

    if (!res.ok) {
        throw data;
    }

    return data;
}

export function getErrorMessage(error: unknown): string | undefined {
    if (typeof error !== "object" || error === null) {
        return undefined;
    }

    if ("message" in error && typeof error.message === "string" && error.message.trim()) {
        return error.message;
    }

    if ("error" in error) {
        if (typeof error.error === "string" && error.error.trim()) {
            return error.error;
        }
        if (
            typeof error.error === "object" &&
            error.error !== null &&
            "message" in error.error &&
            typeof error.error.message === "string" &&
            error.error.message.trim()
        ) {
            return error.error.message;
        }
    }

    return undefined;
}
