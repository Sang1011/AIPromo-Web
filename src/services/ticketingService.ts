import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";
import type {
    AllEventSalesTrendResponse,
    CreatePendingOrderRequest,
    GetOrdersRequest,
    GetSalesTrendRequest,
    PaginatedOrders,
    StatisticCheckInResponse,
    StatisticOverviewResponse,
    StatisticSalesTrendResponse
} from "../types/ticketing/ticketing";
import { interceptorAPI } from "../utils/attachInterceptors";

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
    getAllEventSalesTrend: (
        startDate: string,
        endDate: string,
    ): Promise<AxiosResponse<AllEventSalesTrendResponse>> => {
        return interceptorAPI().get(
            `/ticketing/report/events/organizer/sales-trend`,
            { params: { startDate, endDate } }
        );
    }
};

export default ticketingService;