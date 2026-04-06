export interface MassRefundItem {
    paymentTransactionId: string;
    userId: string;
    amount: number;
    success: boolean;
    failureReason: string;
}

export interface MassRefundResponse {
    eventSessionId: string;
    totalFound: number;
    succeeded: number;
    skipped: number;
    failed: number;
    items: MassRefundItem[];
}

export interface MassRefundApiResponse {
    isSuccess: boolean;
    data: MassRefundResponse;
    message: string;
    timestamp: string;
}
