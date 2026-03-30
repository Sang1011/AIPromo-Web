import type { ApiResponse } from "../api";

export type EventStatus =
    | "Draft"
    | "PendingReview"
    | "Published"
    | "Suspended"
    | "PendingCancellation"
    | "Cancelled"
    | "Completed";

export interface AdminEventItem {
    id: string;
    organizerId: string;
    title: string;
    status: EventStatus;
    bannerUrl: string;
    location: string;
    eventStartAt: string;
    eventEndAt: string;
    createdAt: string;
}

export interface AdminEventsData {
    items: AdminEventItem[];
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

export type GetAllAdminEventsResponse = ApiResponse<AdminEventsData>;

export interface GetAllAdminEventsRequest {
    OrganizerId?: string;
    Statuses?: string;
    Title?: string;
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: "asc" | "desc" | "";
}
