import type { AxiosResponse } from "axios";
import type { AdminReportsResponse, SalesTrendResponse } from "../types/adminReports/adminReports";
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
};

export default adminReportsService;
