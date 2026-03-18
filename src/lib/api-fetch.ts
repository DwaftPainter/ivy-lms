export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
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
