export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string | null;
    timestamp: string;
}