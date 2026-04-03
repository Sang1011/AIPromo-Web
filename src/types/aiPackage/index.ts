import type { ApiResponse } from "../api";

export interface AIPackage {
    id: string;
    name: string;
    description: string;
    type: string;
    price: number;
    tokenQuota: number;
    isActive: boolean;
}

export type GetListAIPackageResponse = ApiResponse<AIPackage[]>
export type GetDetailAIPackageResponse = ApiResponse<AIPackage>
