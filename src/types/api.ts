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

export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}