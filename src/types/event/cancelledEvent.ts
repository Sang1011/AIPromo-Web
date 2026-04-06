import type { EventStatus } from "./event";

export interface CancelledEventItem {
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

export interface CancelledEventsData {
    items: CancelledEventItem[];
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

export interface CancelledEventsResponse {
    isSuccess: boolean;
    data: CancelledEventsData;
    message: string;
    timestamp: string;
}

export interface GetCancelledEventsRequest {
    Statuses?: string;
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: string;
}
