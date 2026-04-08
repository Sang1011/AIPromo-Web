import type { ApiResponse } from "../api";

export interface EventMember {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    permissions: string[];
    status: EventMemberStatus;
}

export type GetEventMembersResponse = ApiResponse<EventMember[]>;

export interface AddEventMemberRequest {
    email: string;
    permissions: string[];
}

export interface UpdateEventMemberPermissionsRequest {
    permissions: string[];
}

export const EventMemberStatus = {
    Pending: "Pending",
    Active: "Active",
    Rejected: "Rejected",
    Inactive: "Inactive",
} as const;

export type EventMemberStatus = typeof EventMemberStatus[keyof typeof EventMemberStatus];

export interface EventItemByEventMember {
    eventId: string;
    title: string;
    bannerUrl: string;
    eventStartAt: string;
    eventEndAt: string;
    sessions: SessionItemByEventMember[];
    permissions?: string[];
}

export interface SessionItemByEventMember {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
}

export type GetEventListByMemberAssignedResponse = ApiResponse<EventItemByEventMember[]>