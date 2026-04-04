import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GlobalRevenueApiResponse } from "../types/revenue/revenue";

const revenueService = {
    getGlobalRevenue: (): Promise<AxiosResponse<GlobalRevenueApiResponse>> => {
        return interceptorAPI().get("/reports/revenue/global");
    },
};

export default revenueService;
