import type { ApiResponse } from "../api";

export type VoucherType = "Percentage" | "Fixed";

export type CreateVoucherRequest = {
    name: string;
    description: string;
    couponCode: string;
    type: VoucherType;
    value: number;
    maxUse: number;
    startDate: string;
    endDate: string;
    eventId: string;
};

export type UpdateVoucherRequest = {
    name: string;
    description: string;
    couponCode: string;
    type: VoucherType;
    value: number;
    maxUse: number;
    startDate: string;
    endDate: string;
};

export type GetVouchersParams = {
    EventId?: string;
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: "Ascending" | "Descending";
};

export type VoucherItem = {
    id: string;
    name: string;
    description: string;
    couponCode: string;
    type: VoucherType;
    value: number;
    totalUse: number;
    maxUse: number;
    startDate: string;
    endDate: string;
    eventId: string;
    isGlobal: boolean;
    createdAt: string;
};

export type GetVouchersResponse = {
    items: VoucherItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
};

export type GetVoucherDetailResponse = ApiResponse<VoucherItem>;
export type GetVouchersListResponse = ApiResponse<GetVouchersResponse>;