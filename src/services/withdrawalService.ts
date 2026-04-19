import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreateWithdrawal, GetMeWithdrawalParams } from "../types/withdrawal/withdrawal";
import type { WithdrawalApiResponse, WithdrawalQueryParams, WithdrawalDetailApiResponse, WithdrawalActionRequest, WithdrawalActionApiResponse } from "../types/withdrawal/withdrawal";

const withdrawalService = {
    getAllWithdrawalRequests: (params: WithdrawalQueryParams): Promise<AxiosResponse<WithdrawalApiResponse>> => {
        return interceptorAPI().get("/admin/withdrawal-requests", { params });
    },
    getWithdrawalDetail: (id: string): Promise<AxiosResponse<WithdrawalDetailApiResponse>> => {
        return interceptorAPI().get(`/admin/withdrawal-requests/${id}`);
    },
    approveWithdrawal: (id: string, data: WithdrawalActionRequest): Promise<AxiosResponse<WithdrawalActionApiResponse>> => {
        return interceptorAPI().put(`/admin/withdrawal-requests/${id}/approve`, data);
    },
    rejectWithdrawal: (id: string, data: WithdrawalActionRequest): Promise<AxiosResponse<WithdrawalActionApiResponse>> => {
        return interceptorAPI().put(`/admin/withdrawal-requests/${id}/reject`, data);
    },
    completeWithdrawal: (id: string, data: WithdrawalActionRequest): Promise<AxiosResponse<WithdrawalActionApiResponse>> => {
        return interceptorAPI().put(`/admin/withdrawal-requests/${id}/complete`, data);
    },
    createWithdrawal: (data: CreateWithdrawal): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`withdrawal-requests`, data);
    },
    GetWithdrawalme: (
        params: GetMeWithdrawalParams
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(`withdrawal-requests/me`, {
            params: params,
        });
    },
    GetWithdrawalmeDetail: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(`withdrawal-requests/me/${id}`);
    },
};

export default withdrawalService;
