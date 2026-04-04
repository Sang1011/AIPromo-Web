import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetAIQuotaResponse, GetDetailAIPackageResponse, GetListAIPackageResponse, GetPurchasedPackagesResponse } from "../types/aiPackage";

const aiPackageService = {
    getAllAIPackages: (): Promise<AxiosResponse<GetListAIPackageResponse>> => {
        return interceptorAPI().get("/ai/packages");
    },
    getAIPackageById: (id: string): Promise<AxiosResponse<GetDetailAIPackageResponse>> => {
        return interceptorAPI().get(`/ai/packages/${id}`);
    },
    getMyQuota: (): Promise<AxiosResponse<GetAIQuotaResponse>> => {
        return interceptorAPI().get("/ai/quotas/me");
    },

    getPurchasedPackages: (): Promise<AxiosResponse<GetPurchasedPackagesResponse>> => {
        return interceptorAPI().get("/ai/packages/me/purchased");
    }
}

export default aiPackageService;
