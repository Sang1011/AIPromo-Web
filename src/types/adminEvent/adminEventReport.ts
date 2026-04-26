import type { ApiResponse } from "../api";

// ── Raw API response shapes ──────────────────────────────────────────────────

export interface RevenueOverview {
    totalRevenueBeforeRefund: number;
    totalTicketsSold: number;
    netRevenue: number;
    refundOrderCount: number;
    totalRefundAmount: number;
    occupancyRate: number;
    averageRevenuePerTicket: number;
}

export interface RevenueByTicketType {
    ticketTypeName: string;
    listedPrice: number;
    discountedPrice: number;
    issuedQuantity: number;
    soldQuantity: number;
    cancelledOrRefundedQuantity: number;
    revenue: number;
    contributionRate: number;
    status: string;
}

export interface RevenueProfit {
    grossProfit: number;
    profitMargin: number;
}

export interface RevenueRefunds {
    refundOrderCount: number;
    totalRefundAmount: number;
    refundRate: number;
}

export interface RevenueDiscountCode {
    code: string;
    usageCount: number;
    totalDiscountAmount: number;
    netRevenueAfterDiscount: number;
}

export interface EventRevenueDetailData {
    overview: RevenueOverview;
    byTicketType: RevenueByTicketType[];
    profit: RevenueProfit;
    refunds: RevenueRefunds;
    discountCodes: RevenueDiscountCode[];
}

export type GetEventRevenueDetailResponse = ApiResponse<EventRevenueDetailData>;
