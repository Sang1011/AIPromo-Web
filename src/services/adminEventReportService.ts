import type { AxiosResponse } from "axios";
import type { GetEventRevenueDetailResponse } from "../types/adminEvent/adminEventReport";
import { interceptorAPI } from "../utils/attachInterceptors";

const adminEventReportService = {
    getEventRevenueDetail: (
        eventId: string
    ): Promise<AxiosResponse<GetEventRevenueDetailResponse>> => {
        return interceptorAPI().get(`/admin/reports/events/${eventId}/revenue-details`);
    },
};

export default adminEventReportService;
