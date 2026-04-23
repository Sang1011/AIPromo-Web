import type { AxiosResponse } from "axios";
import type {
    AdminReportsResponse,
    SalesTrendResponse,
    TopEventsResponse,
    FundFlowResponse,
    FundFlowPeriod,
} from "../types/adminReports/adminReports";
import { interceptorAPI } from "../utils/attachInterceptors";

const adminReportsService = {
    getOverview: (): Promise<AxiosResponse<AdminReportsResponse>> => {
        return interceptorAPI().get("/admin/reports/overview");
    },
    getSalesTrend: (days: number): Promise<AxiosResponse<SalesTrendResponse>> => {
        return interceptorAPI().get("/admin/reports/sales-trend", {
            params: { days },
        });
    },
    getTopEvents: (top: number): Promise<AxiosResponse<TopEventsResponse>> => {
        return interceptorAPI().get("/admin/reports/top-events", {
            params: { top },
        });
    },
    getFundFlow: (period: FundFlowPeriod): Promise<AxiosResponse<FundFlowResponse>> => {
        return interceptorAPI().get("/admin/reports/fund-flow", {
            params: { period },
        });
    },
};

export default adminReportsService;