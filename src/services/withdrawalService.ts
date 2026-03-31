import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { WithdrawalApiResponse, WithdrawalQueryParams, WithdrawalDetailApiResponse } from "../types/withdrawal/withdrawal";

const withdrawalService = {
    getAllWithdrawalRequests: (params: WithdrawalQueryParams): Promise<AxiosResponse<WithdrawalApiResponse>> => {
        return interceptorAPI().get("/admin/withdrawal-requests", { params });
    },
    getWithdrawalDetail: (id: string): Promise<AxiosResponse<WithdrawalDetailApiResponse>> => {
        return interceptorAPI().get(`/admin/withdrawal-requests/${id}`);
    }
};

export default withdrawalService;
