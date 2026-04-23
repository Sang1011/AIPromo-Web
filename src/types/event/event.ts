import type { ApiResponse } from "../api";

export interface GetAllRequest {
    CategoryId?: number,
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
    id: string;
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
    minPrice: number;
    maxPrice: number;
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
    sessions: Omit<EventSession, "ticketTypes" | "id">[];
}

export interface UpdateEventSettingsRequest {
    isEmailReminderEnabled: boolean;
    urlPath?: string;
    specImage?: string;
    ticketSaleStartAt?: string;
    ticketSaleEndAt?: string;
    eventStartAt?: string;
    eventEndAt?: string;
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

export interface EventDetailTicketTypes {
    id: string;
    name: string;
    price: number;
    quantity: number;
    soldQuantity: number;
    remainingQuantity: number;
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
    specImage: string;
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
    cancellationReason?: string;
    publishRejectionReason?: string;
    cancellationRejectionReason?: string;
    suspensionReason?: string;
    suspendedAt?: string;
    suspendedUntilAt?: string;
    suspendedBy?: string;
    createdAt: string;
    modifiedAt: string;
    categories: EventCategory[];
    images: EventImage[];
    sessions: EventSession[];
    hashtags: EventHashtag[];
    actorImages: EventActorImage[];
    ticketTypes: EventDetailTicketTypes[];
}

export type GetAllSessionResponse = EventSession[];
export type UpdateEventSessionRequest = Omit<EventSession, "ticketTypes" | "id">;

export interface GetAllRequestByMe extends GetAllRequest {
    Statuses?: string;
}

export interface EventItemByMe {
    id: string;
    title: string;
    status: EventStatus;
    bannerUrl: string;
    location: string;
    eventStartAt: string | null;
    eventEndAt: string | null;
    urlPath: string | null;
    createdAt: string;
    cancellationReason: string | null;
    publishRejectionReason: string | null;
    cancellationRejectionReason: string | null;
    suspensionReason: string | null;
    suspendedAt: string | null;
    suspendedUntilAt: string | null;
    suspendedBy: string | null;
}

export type GetAllCreateResponseForPrivate = {
    items: EventItemByMe[];
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

export const SPEAKER_PROFESSION_GROUPS: { label: string; items: string[] }[] = [
    {
        label: "Kinh doanh & Lãnh đạo",
        items: ["Doanh nhân", "Nhà sáng lập (Founder)", "Lãnh đạo cấp cao (C-level)", "Quản lý", "CEO"],
    },
    {
        label: "Chuyên gia & Tư vấn",
        items: ["Chuyên gia", "Tư vấn (Consultant)", "Huấn luyện viên (Coach)"],
    },
    {
        label: "Giáo dục & Nghiên cứu",
        items: ["Giảng viên", "Giáo sư", "Nhà nghiên cứu"],
    },
    {
        label: "Công nghệ",
        items: ["Kỹ sư", "Lập trình viên (Developer)", "Chuyên gia IT"],
    },
    {
        label: "Nghiệp vụ",
        items: ["Chuyên gia Marketing", "Chuyên gia Tài chính", "Chuyên gia Nhân sự (HR)"],
    },
    {
        label: "Nội dung & Truyền thông",
        items: [
            "Nhà sáng tạo nội dung (Content Creator)",
            "Influencer / KOL / KOC",
            "YouTuber",
            "TikToker",
            "Streamer",
            "Podcaster",
            "Nhà báo",
            "Biên tập viên",
            "Tác giả",
        ],
    },
    {
        label: "Giải trí & Sự kiện",
        items: [
            "Nghệ sĩ",
            "Ca sĩ",
            "Diễn viên",
            "MC / Host / Presenter",
            "Producer",
            "Diễn giả truyền cảm hứng",
        ],
    },
    {
        label: "Khác",
        items: ["Đại diện tổ chức (NGO)", "Freelancer", "Sinh viên", "Khách mời (Guest Speaker)", "Khác"],
    },
];