export interface GetAllRequest {
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: string;
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
    status: string;
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
}

export interface UpdateEventInfoRequest extends Omit<CreateEventRequest, "organizerId"> { }

export interface CreateEventSessionRequest {
    sessions: EventSession[];
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

export interface GetEventDetailResponse {
    id: string;
    organizerId: string;
    title: string;
    status: string;
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
}
