import type { AxiosResponse } from "axios";
import type { AdminPaymentTransactionsResponse, PaymentHistoryParamsRequest, PaymentMyOrderResponse, PaymentOrderPaymentRequest, PaymentOrderPaymentResponse } from "../types/payment/payment";
import { interceptorAPI } from "../utils/attachInterceptors";

const paymentService = {
    paymentOrder: (data: PaymentOrderPaymentRequest): Promise<AxiosResponse<PaymentOrderPaymentResponse>> => {
        return interceptorAPI().post(`/payments`, data)
    },
    paymentOrderHistory: (params: PaymentHistoryParamsRequest): Promise<AxiosResponse<PaymentMyOrderResponse>> => {
        return interceptorAPI().post(`/payments/my`, null, {
            params,
        });
    },
    getAdminPaymentTransactions: (params: {
        PageNumber: number;
        PageSize: number;
        SortColumn?: string;
        SortOrder?: string;
        UserId?: string;
        OrderId?: string;
        EventId?: string;
        Type?: string;
        Status?: string;
        AmountMin?: number;
        AmountMax?: number;
        CreatedFrom?: string;
        CreatedTo?: string;
        GatewayTxnRef?: string;
    }): Promise<AxiosResponse<AdminPaymentTransactionsResponse>> => {
        return interceptorAPI().get(`/payments`, { params });
    },

}
export default paymentService;