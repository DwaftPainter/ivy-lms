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
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    ) {
        return error.message;
    }
}
