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
