import type { ApiResponse } from "../api";
import type { EventStatus } from "../event/event";

export interface GrossRevenueReportItem {
    eventId: string;
    revenue: number;
}

export interface NetRevenueReportItem {
    eventId: string;
    revenue: number;
}

export type RefundAmountReportItem = number;
export interface RefundRateReportItem {
    eventId: string;
    grossRevenue: number;
    totalRefunds: number;
    refundRatePercent: number;
}

export interface TransactionSummaryReportItem {
    eventId: string;
    totalTransactions: number;
    completedCount: number;
    failedCount: number;
    refundedCount: number;
    walletPayAmount: number;
    directPayAmount: number;
}

export interface RevenueSummaryOrganizerReportItem {
    organizerId: string;
    grossRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    eventCount: number;
    completedEventCount: number;
    activeEventCount: number;
    upcomingEventCount: number;
}

export interface RevenueBreakdownOrganizerReportItem {
    organizerId: string;
    perEvent: BreakdownItem[];
}

export type BreakdownItem = {
    eventId: string;
    eventName: string;
    grossRevenue: number;
    netRevenue: number;
    refundAmount: number;
    refundRate: number;
    status: EventStatus;
}
export interface GrossRevenueByEventItem {
    eventId: string;
    revenue: number;
}

export interface NetRevenueByEventItem {
    eventId: string;
    revenue: number;
}

export type GrossRevenueByEventResponse = ApiResponse<GrossRevenueByEventItem[]>;
export type NetRevenueByEventResponse = ApiResponse<NetRevenueByEventItem[]>;
export type GrossRevenueReportReponse = ApiResponse<GrossRevenueReportItem>;
export type NetRevenueReportResponse = ApiResponse<NetRevenueReportItem>;
export type RefundAmountReportResponse = ApiResponse<RefundAmountReportItem>;
export type RefundRateReportResponse = ApiResponse<RefundRateReportItem>;
export type TransactionSummaryReportResponse = ApiResponse<TransactionSummaryReportItem>;
export type RevenueSummaryOrganizerReportResponse = ApiResponse<RevenueSummaryOrganizerReportItem>;
export type RevenueBreakdownOrganizerReportResponse = ApiResponse<RevenueBreakdownOrganizerReportItem>;