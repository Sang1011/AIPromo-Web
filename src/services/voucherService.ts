import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type {
    CreateVoucherRequest,
    UpdateVoucherRequest,
    GetVouchersParams,
    GetVouchersListResponse,
    GetVoucherDetailResponse,
} from "../types/voucher/voucher";
import type { ApiResponse } from "../types/api";

const voucherService = {
    createVoucher: (
        data: CreateVoucherRequest
    ): Promise<AxiosResponse<string>> => {
        return interceptorAPI().post("/ticketing/vouchers", data);
    },

    getVouchers: (
        params?: GetVouchersParams
    ): Promise<AxiosResponse<GetVouchersListResponse>> => {
        return interceptorAPI().get("/ticketing/vouchers", { params });
    },

    getVoucherById: (
        voucherId: string
    ): Promise<AxiosResponse<GetVoucherDetailResponse>> => {
        return interceptorAPI().get(`/ticketing/vouchers/${voucherId}`);
    },

    updateVoucher: (
        voucherId: string,
        data: UpdateVoucherRequest
    ): Promise<AxiosResponse<ApiResponse<null>>> => {
        return interceptorAPI().put(`/ticketing/vouchers/${voucherId}`, data);
    },

    deleteVoucher: (
        voucherId: string
    ): Promise<AxiosResponse<ApiResponse<null>>> => {
        return interceptorAPI().delete(`/ticketing/vouchers/${voucherId}`);
    },
};

export default voucherService;