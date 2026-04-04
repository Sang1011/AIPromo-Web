import type { ApiResponse } from "../api";

export interface CreatePendingOrderRequest {
    eventId: string,
    tickets: TicketRequest[];
}

export interface TicketRequest {
    eventSessionId: string;
    ticketTypeId: string;
    seatId?: string;
}

export interface OrderItemOrganizer {
    orderId: string;
    createdAt: string;
    buyerName: string;
    buyerEmail: string;
    totalPrice: number;
    originalPrice: number;
    voucherCode: string;
    discountAmount: number;
    status: string;
}

export interface PaginatedOrders {
    items: OrderItemOrganizer[];
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

export interface GetOrdersRequest {
    eventId: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface CheckInStatistic {
    summary: SummaryCheckIn;
    ticketStats: TicketStat[];
}

export interface SummaryCheckIn {
    totalTicketTypes: number;
    totalTicketQuantity: number;
    totalSold: number;
    totalCheckedIn: number;
    checkInRate: number;
}

export interface TicketStat {
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    sold: number;
    checkedIn: number;
}

export type StatisticCheckInResponse = ApiResponse<CheckInStatistic>

export interface OverviewStatistic {
    eventId: string;
    summary: SummaryOverview;
    ticketTypeBreakdown: TicketTypeBreakdown[];
}

export interface SummaryOverview {
    totalOrders: number;
    totalTicketsSold: number;
    totalTicketsCheckedIn: number;
    checkInRate: number;
    grossRevenue: number;
    totalDiscount: number;
    netRevenue: number;
}

export interface TicketTypeBreakdown {
    ticketTypeId: string;
    ticketTypeName: string;
    totalQuantity: number;
    quantitySold: number;
    quantityCheckedIn: number;
    revenue: number;
}

export type StatisticOverviewResponse = ApiResponse<OverviewStatistic>

// --- Sales Trend ---
export type SalesTrendPeriod = "Day" | "Week";

export interface SalesTrendItem {
    timeLabel: string;
    ticketsSold: number;
    revenue: number;
}

export interface SalesTrendData {
    eventId: string;
    period: string;
    trend: SalesTrendItem[];
}

export type StatisticSalesTrendResponse = ApiResponse<SalesTrendData>

export interface GetSalesTrendRequest {
    eventId: string;
    period: SalesTrendPeriod;
}