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
    status: OrganizerStatus;
    type: string;
    verifiedAt: string;
}

export const OrganizerStatus = {
    Draft: "Draft",
    Pending: "Pending",
    Verified: "Verified",
    Rejected: "Rejected",
    Suspended: "Suspended",
    Archived: "Archived",
} as const;

export type OrganizerStatus =
    typeof OrganizerStatus[keyof typeof OrganizerStatus];

export type GetOrganizerProfileResponse = ApiResponse<OrganizerProfile>;

// request để tạo tổ chức
export interface CreateProfileOrganizerRequest {
    logoFile: File,
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