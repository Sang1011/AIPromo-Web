import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAllPoliciesResponse, GetPolicyByIdResponse, PolicyRequest } from "../types/policy/policy";

const policyService = {
    getAllPolicies: (): Promise<AxiosResponse<GetAllPoliciesResponse>> => {
        return interceptorAPI().get("/policies");
    },
    getPolicyById: (id: string): Promise<AxiosResponse<GetPolicyByIdResponse>> => {
        return interceptorAPI().get(`/policies/${id}`);
    },
    postPolicy: (data: PolicyRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/policies`, data);
    },
    postPolicyfile: (data: { file: File }): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append("file", data.file);
        return interceptorAPI().post(`/policies/upload`, formData);
    },
    deletePolicy: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/policies/${id}`);
    },
}

export default policyService;
