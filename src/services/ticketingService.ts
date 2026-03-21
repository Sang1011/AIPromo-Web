import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePendingOrderRequest } from "../types/ticketing/ticketing";
const ticketingService = {
    createPendingOrder: (data: CreatePendingOrderRequest): Promise<AxiosResponse<string>> => {
        return interceptorAPI().post("/ticketing/orders", data);
    }
};

export default ticketingService;