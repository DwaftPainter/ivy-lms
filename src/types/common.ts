export type ApiResponse<T> = {
    success: boolean,
    message: string,
    redirectTo?: string,
    data: T,
    timestamp: string
}