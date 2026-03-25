import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAllOrderRequest, GetAllOrderResponse } from "../types/order/order";

const orderService = {
   getDetailOrder: (orderId: string): Promise<AxiosResponse<any>>=>{
    return interceptorAPI().get(`/ticketing/${orderId}`)
   },
   getAllOrder: (data: GetAllOrderRequest): Promise<AxiosResponse<GetAllOrderResponse>>=>{
       return interceptorAPI().get("/ticketing", {
            params: data
        })
   }
}

export default orderService;
