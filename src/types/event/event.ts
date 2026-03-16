import type { ApiResponse } from "../api";

export interface GetAllRequest {
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: string;
}

export type EventStatus =
    | "Draft"
    | "PendingReview"
    | "Published"
    | "Suspended"
    | "PendingCancellation"
    | "Cancelled"
    | "Completed";

export interface EventTicketType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    soldQuantity: number;
    availableQuantity: number;
    type: string;
    areaId: string;
}

export interface EventCategory {
    id: number;
    name: string;
}

export interface EventHashtag {
    id: number;
    name: string;
}

export interface EventImage {
    id: string;
    imageUrl: string;
}

export interface EventSession {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    ticketTypes?: EventTicketType[];
}

export interface ActorImage {
    name: string;
    major: string;
    image: string;
}

export interface EventActorImage {
    id: string;
    name: string;
    major: string;
    image: string;
}

export interface EventItem {
    id: string;
    title: string;
    status: EventStatus;
    bannerUrl: string;
    location: string;
    eventStartAt: string;
    eventEndAt: string;
    urlPath: string;
    createdAt: string;
    categories: EventCategory[];
}

export interface CreateEventRequest {
    organizerId: string;
    title: string;
    bannerUrl: string;
    hashtagIds: number[];
    categoryIds: number[];
    location: string;
    mapUrl: string;
    description: string;
    actorImages: ActorImage[];
    imageUrls: string[];
}

export interface UpdateEventInfoRequest extends Omit<CreateEventRequest, "organizerId"> { }

export interface CreateEventSessionRequest {
    sessions: Omit<EventSession, "ticketTypes">[];
}

export interface UpdateEventSettingsRequest {
    isEmailReminderEnabled: boolean;
    urlPath: string;
    ticketSaleStartAt: string;
    ticketSaleEndAt: string;
    eventStartAt: string;
    eventEndAt: string;
}

export interface GetAllEventResponse {
    data: {
        items: EventItem[];
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
}

export interface EventDetailTicketTypes {
    id: string;
    name: string;
    price: number;
    areaId: string;
    areaName: string;
    areaType: string;
}

export interface GetEventDetailResponse {
    id: string;
    organizerId: string;
    title: string;
    status: EventStatus;
    bannerUrl: string;
    location: string;
    mapUrl: string;
    description: string;
    urlPath: string;
    ticketSaleStartAt: string;
    ticketSaleEndAt: string;
    eventStartAt: string;
    eventEndAt: string;
    policy: string;
    isEmailReminderEnabled: boolean;
    createdAt: string;
    modifiedAt: string;
    categories: EventCategory[];
    images: EventImage[];
    sessions: EventSession[];
    hashtags: EventHashtag[];
    actorImages: EventActorImage[];
    ticketTypes: EventDetailTicketTypes[]
}

export type GetAllSessionResponse = EventSession[];
export type UpdateEventSessionRequest = Omit<EventSession, "ticketTypes">;

export interface GetAllRequestByMe extends GetAllRequest {
    Statuses?: string;
}

export type GetAllCreateResponseForPrivate = {
    items: EventItem[];
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

export type GetAllEventByMeResponse = ApiResponse<GetAllCreateResponseForPrivate>

export interface CreateTicketTypeRequest {
    name: string;
    price: number;
    quantity: number;
    type: "Zone" | "Seat";
    areaId: string;
}

export interface UpdateTicketTypeRequest {
    name: string;
    price: number;
    quantity: number;
}


export interface PendingEventsData {
    items: EventItem[];
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

export type GetPendingEventsResponse = ApiResponse<PendingEventsData>;

export interface GetPendingEventsRequest extends GetAllRequest {
    Title?: string;
    Statuses?: string;
}
export type UpdateSeatMapRequest = {
    eventId: string;
    spec: string;
}