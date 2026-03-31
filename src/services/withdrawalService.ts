import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { WithdrawalRequest } from "../types/withdrawal/withdrawal";


const withdrawalService = {
    createWithdrawal: (data: WithdrawalRequest  ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`withdrawal-requests`,data);
    },
 

}

export default withdrawalService;
