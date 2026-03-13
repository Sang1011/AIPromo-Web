import type { ApiResponse } from "../api";

export interface OrganizerProfile {
    id: string;
    userId: string;
    logo: string;
    displayName: string;
    description: string;
    address: string;
    socialLink: string;
    businessType: string;
    taxCode: string;
    identityNumber: string;
    companyName: string;
    accountName: string;
    accountNumber: string;
    bankCode: string;
    branch: string;
    status: string;
    type: string;
    verifiedAt: string;
}

export type GetOrganizerProfileResponse = ApiResponse<OrganizerProfile>;

export interface UpdateOrganizerProfileRequest {
    logo: string;
    displayName: string;
    description: string;
    address: string;
    socialLink: string;
    businessType: "company" | string;
    taxCode: string;
    identityNumber: string;
    companyName: string;
}

export interface UpdateOrganizerBankRequest {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    branch: string;
}