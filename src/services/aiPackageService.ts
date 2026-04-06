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
    ,
    createAIPackage: (payload: any): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post("/ai/packages", payload);
    },
    updateAIPackage: (id: string, payload: any): Promise<AxiosResponse<any>> => {
        return interceptorAPI().put(`/ai/packages/${id}`, payload);
    },
    deleteAIPackage: (id: string): Promise<AxiosResponse<void>> => {
        return interceptorAPI().delete(`/ai/packages/${id}`);
    },
    togglePackageStatus: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/ai/packages/${id}/toggle-status`);
    }
}

export default aiPackageService;
