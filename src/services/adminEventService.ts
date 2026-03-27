import type { AxiosResponse } from "axios";
import type { GetAllAdminEventsResponse } from "../types/adminEvent/adminEvent";
import { interceptorAPI } from "../utils/attachInterceptors";

const adminEventService = {
    getAllEvents: (params: { PageNumber: number; PageSize: number }): Promise<AxiosResponse<GetAllAdminEventsResponse>> => {
        return interceptorAPI().get("/admin/events", {
            params
        });
    },
};

export default adminEventService;
