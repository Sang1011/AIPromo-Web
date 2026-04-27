import type { ApiResponse, PaginatedResponse } from "../api";

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
    voucherCode: string | null;
    discountAmount: number | null;
    status: string;
}

export interface OrderSummary {
    totalOrders: number;
    grossRevenue: number;
    netRevenue: number;
    totalDiscount: number;
    cancelledOrders: number;
}

export interface PaginatedOrders {
    orders: PaginatedResponse<OrderItemOrganizer>;
    summary: OrderSummary;
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

export interface GetSalesTrendRequest {
    eventId: string;
    period: SalesTrendPeriod;
}

export interface AllEventSalesTrendResponseItem {
    organizerId: string;
    startDate: Date;
    endDate: Date;
    events: AllEventSalesTrendItem[];
}

export interface AllEventSalesTrendItem {
    eventId: string;
    title: string;
    salesTrend: SalesTrendAllEventItem[];
}


export interface SalesTrendAllEventItem {
    time: Date;
    ticketsSold: number;
    netRevenue: number;
    grossRevenue: number;
}

export type StatisticSalesTrendResponse = ApiResponse<SalesTrendData>
export type AllEventSalesTrendResponse = ApiResponse<AllEventSalesTrendResponseItem>