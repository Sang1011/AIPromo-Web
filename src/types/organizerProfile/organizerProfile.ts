import type { ApiResponse } from "../api";

export interface OrganizerProfileDetail {
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

// request để tạo tổ chức
export interface CreateProfileOrganizerRequest {
    type: string;
    logo: string | null;
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
}

export interface OrganizerProfile {
    profileId: string;
    userId: string;
    displayName: string;
    logo: string;
    status: string;
    rejectionReason: null;
    canEdit: boolean;
    canSubmit: boolean;
}

// Types for pending organizers (Admin/Staff)
export interface PendingOrganizerItem {
    userId: string;
    profileId: string;
    displayName: string;
    status: string;
    businessType: string;
    versionNumber: number;
    createdAt: string;
}

export interface PendingOrganizersData {
    items: PendingOrganizerItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export type GetPendingOrganizersResponse = ApiResponse<PendingOrganizersData>;