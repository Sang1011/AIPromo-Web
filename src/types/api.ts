export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string | null;
    timestamp: string;
}

export interface ApiResponseNoData {
    isSuccess: boolean;
    message: string | null;
    timestamp: string;
}