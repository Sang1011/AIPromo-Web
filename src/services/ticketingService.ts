import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePendingOrderRequest } from "../types/ticketing/ticketing";
import type { ApiResponse } from "../types/api";
const ticketingService = {
    createPendingOrder: (data: CreatePendingOrderRequest): Promise<AxiosResponse<ApiResponse<string>>> => {
        return interceptorAPI().post("/ticketing/orders", data);
    }
};

export default ticketingService;