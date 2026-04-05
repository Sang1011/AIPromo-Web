import type { ApiResponse } from "../api";

export type AIPackageType = "TopUp" | "Subscription";

export interface AIPackage {
    id: string;
    name: string;
    description: string;
    type: AIPackageType;
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
    type: AIPackageType;
    price: number;
    tokenQuota: number;
    isActive: boolean;
    purchaseCount: number;
    totalPurchasedTokens: number;
    lastPurchasedAt: string;
}

export interface PaymentPackageRequest {
    packageId: string;
    method: string;
    description: string;
    returnUrl: string;
}

export interface PaymentPackageItem {
    paymentTransactionId: string;
    paymentUrl: string;
    totalAmount: number;
    completedAt: string;
}

export type CreatePaymentPackageResponse = ApiResponse<PaymentPackageItem>;
export type GetPurchasedPackagesResponse = ApiResponse<AIPurchasedPackage[]>;
export type GetAIQuotaResponse = ApiResponse<AIQuota>;
export type GetListAIPackageResponse = ApiResponse<AIPackage[]>;
export type GetDetailAIPackageResponse = ApiResponse<AIPackage>;