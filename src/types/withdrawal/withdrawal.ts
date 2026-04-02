export interface WithdrawalRequest {
    id: string;
    userId: string;
    walletId: string;
    amount: number;
    bankAccountNumber: string;
    bankName: string;
    status: "Pending" | "Approved" | "Rejected" | "Success" | string;
    createdAt: string;
    processedAt: string | null;
    userName?: string;
    email?: string;
    avatar?: string;
}

export interface CreateWithdrawal{
    bankAccountNumber: string;
    bankName: string;
    amount: number;
    notes?: string;
}

export interface WithdrawalDetail {
    id: string;
    userId: string;
    walletId: string;
    amount: number;
    bankAccountNumber: string;
    bankName: string;
    status: "Pending" | "Approved" | "Rejected" | "Success" | string;
    notes: string | null;
    adminNote: string | null;
    walletTransactionId: string | null;
    createdAt: string;
    processedAt: string | null;
}

export interface WithdrawalActionRequest {
    adminNote: string;
}

export interface WithdrawalListResponse {
    items: WithdrawalRequest[];
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

export interface WithdrawalApiResponse {
    isSuccess: boolean;
    data: WithdrawalListResponse;
    message: string;
    timestamp: string;
}

export interface WithdrawalDetailApiResponse {
    isSuccess: boolean;
    data: WithdrawalDetail;
    message: string;
    timestamp: string;
}

export interface WithdrawalActionApiResponse {
    isSuccess: boolean;
    data: null;
    message: string;
    timestamp: string;
}

export interface WithdrawalQueryParams {
    PageNumber: number;
    PageSize: number;
    SortColumn: string;
    SortOrder: "asc" | "desc";
    UserId?: string;
    Status?: string;
    CreatedFrom?: string;
}
