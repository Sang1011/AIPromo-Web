import type { AxiosResponse } from "axios";
import type {  PaymentHistoryParamsRequest, PaymentMyOrderResponse, PaymentOrderPaymentRequest, PaymentOrderPaymentResponse } from "../types/payment/payment";
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

}
export default paymentService;