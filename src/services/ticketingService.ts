import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePendingOrderRequest, GetOrdersRequest, PaginatedOrders } from "../types/ticketing/ticketing";
import type { ApiResponse } from "../types/api";
const ticketingService = {
    createPendingOrder: (data: CreatePendingOrderRequest): Promise<AxiosResponse<ApiResponse<string>>> => {
        return interceptorAPI().post("/ticketing/orders", data);
    },
    getAllOrderByCurrentOrganizer: (
        params: GetOrdersRequest
    ): Promise<AxiosResponse<ApiResponse<PaginatedOrders>>> => {
        return interceptorAPI().get("/organizer/ticketing/orders", {
            params,
        });
    },
};

export default ticketingService;