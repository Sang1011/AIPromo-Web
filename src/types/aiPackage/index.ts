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

export interface AIQuota {
    organizerId: string;
    subscriptionTokens: number;
    topUpTokens: number;
    totalTokens: number;
}

export interface AIPurchasedPackage {
    packageId: string;
    name: string;
    description: string;
    type: string;
    price: number;
    tokenQuota: number;
    isActive: boolean;
    purchaseCount: number;
    totalPurchasedTokens: number;
    lastPurchasedAt: string;
}

export type GetPurchasedPackagesResponse = ApiResponse<AIPurchasedPackage[]>;
export type GetAIQuotaResponse = ApiResponse<AIQuota>;
export type GetListAIPackageResponse = ApiResponse<AIPackage[]>
export type GetDetailAIPackageResponse = ApiResponse<AIPackage>
