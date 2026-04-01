import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type {
    CreatePendingOrderRequest,
    GetOrdersRequest,
    GetSalesTrendRequest,
    PaginatedOrders,
    StatisticCheckInResponse,
    StatisticOverviewResponse,
    StatisticSalesTrendResponse,
} from "../types/ticketing/ticketing";
import type { ApiResponse } from "../types/api";

const ticketingService = {
    createPendingOrder: (
        data: CreatePendingOrderRequest
    ): Promise<AxiosResponse<ApiResponse<string>>> => {
        return interceptorAPI().post("/ticketing/orders", data);
    },

    getAllOrderByCurrentOrganizer: (
        params: GetOrdersRequest
    ): Promise<AxiosResponse<ApiResponse<PaginatedOrders>>> => {
        return interceptorAPI().get("/organizer/ticketing/orders", { params });
    },

    getCheckInStats: (
        eventId: string,
        sessionId: string
    ): Promise<AxiosResponse<StatisticCheckInResponse>> => {
        return interceptorAPI().get(
            `/ticketing/report/events/${eventId}/check-in-stats?sessionId=${sessionId}`
        );
    },

    getOverviewStats: (
        eventId: string
    ): Promise<AxiosResponse<StatisticOverviewResponse>> => {
        return interceptorAPI().get(
            `/ticketing/report/events/${eventId}/ticket-sales`
        );
    },

    getSalesTrend: (
        params: GetSalesTrendRequest
    ): Promise<AxiosResponse<StatisticSalesTrendResponse>> => {
        return interceptorAPI().get(
            `/ticketing/report/events/${params.eventId}/sales-trend`,
            { params: { period: params.period } }
        );
    },
};

export default ticketingService;