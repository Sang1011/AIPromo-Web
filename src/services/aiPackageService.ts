import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { CreatePaymentPackageResponse, GetAIQuotaResponse, GetDetailAIPackageResponse, GetListAIPackageResponse, GetPurchasedPackagesResponse, PaymentPackageRequest } from "../types/aiPackage/aiPackage";

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
    },
    createPaymentPackage: (body: PaymentPackageRequest): Promise<AxiosResponse<CreatePaymentPackageResponse>> => {
        return interceptorAPI().post("/payments/packages", body);
    }
}

export default aiPackageService;
