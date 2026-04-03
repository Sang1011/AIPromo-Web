import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { GetDetailAIPackageResponse, GetListAIPackageResponse } from "../types/aiPackage";

const aiPackageService = {
    getAllAIPackages: (): Promise<AxiosResponse<GetListAIPackageResponse>> => {
        return interceptorAPI().get("/ai/packages");
    },
    getAIPackageById: (id: string): Promise<AxiosResponse<GetDetailAIPackageResponse>> => {
        return interceptorAPI().get(`/ai/packages/${id}`);
    }
}

export default aiPackageService;
