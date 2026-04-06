import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAllPoliciesResponse, GetPolicyByIdResponse } from "../types/policy/policy";
const policyService = {
    getAllPolicies: (): Promise<AxiosResponse<GetAllPoliciesResponse>> => {
        return interceptorAPI().get("/policies");
    },
    getPolicyById: (id: string): Promise<AxiosResponse<GetPolicyByIdResponse>> => {
        return interceptorAPI().get(`/policies/${id}`);
    }
}

export default policyService;
