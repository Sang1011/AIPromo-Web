import type { ApiResponse } from "../api";

export interface EventMember {
    id: string;
    email: string;
    permissions: string[];
}

export type GetEventMembersResponse = ApiResponse<EventMember[]>;

export interface AddEventMemberRequest {
    email: string;
    permissions: string[];
}

export interface UpdateEventMemberPermissionsRequest {
    permissions: string[];
}