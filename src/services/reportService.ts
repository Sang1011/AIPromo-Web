import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GrossRevenueReportReponse, NetRevenueReportResponse, RefundAmountReportResponse, RefundRateReportResponse, RevenueBreakdownOrganizerReportResponse, RevenueSummaryOrganizerReportResponse, TransactionSummaryReportResponse } from "../types/report/report";

const reportService = {
    getGrossRevenueReport: (eventId: string): Promise<AxiosResponse<GrossRevenueReportReponse>> => {
        return interceptorAPI().post(`/reports/revenue/event`, { eventId });
    },
    getNetRevenueReport: (eventId: string): Promise<AxiosResponse<NetRevenueReportResponse>> => {
        return interceptorAPI().post(`/reports/revenue/net`, { eventId });
    },
    getRefundAmountReport: (eventId: string): Promise<AxiosResponse<RefundAmountReportResponse>> => {
        return interceptorAPI().post(`/reports/revenue/refunds`, { eventId });
    },
    getRefundRateReport: (eventId: string): Promise<AxiosResponse<RefundRateReportResponse>> => {
        return interceptorAPI().post(`/reports/revenue/refund-rate`, { eventId });
    },
    getTransactionSummaryReport: (eventId: string): Promise<AxiosResponse<TransactionSummaryReportResponse>> => {
        return interceptorAPI().post(`/reports/revenue/transaction-summary`, { eventId });
    },
    getRevenueSummaryOrganizerReport: (organizerId: string): Promise<AxiosResponse<RevenueSummaryOrganizerReportResponse>> => {
        return interceptorAPI().get(`/reports/revenue/organizer/${organizerId}/summary`);
    },
    getRevenueBreakdownOrganizerReport: (organizerId: string, byNet: boolean): Promise<AxiosResponse<RevenueBreakdownOrganizerReportResponse>> => {
        return interceptorAPI().get(`/reports/revenue/organizer/${organizerId}/events?byNet=${byNet}`);
    }
};

export default reportService;