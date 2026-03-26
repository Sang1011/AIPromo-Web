import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { ToUpWalletResquest } from "../types/wallet/wallet";

const walletService = {
     getWalletUser: (litmit: number  ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(`/wallet?transactionLimit=${litmit}`);
    },
    topUpWalletUser: (data : ToUpWalletResquest): Promise<AxiosResponse<any>>=>{
        return interceptorAPI().post(`payments/topup`, data)
    }

}

export default walletService;
