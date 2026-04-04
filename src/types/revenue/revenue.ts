export interface GlobalRevenue {
    grossRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    eventCount: number;
}

export interface GlobalRevenueApiResponse {
    isSuccess: boolean;
    data: GlobalRevenue;
    message: string;
    timestamp: string;
}
