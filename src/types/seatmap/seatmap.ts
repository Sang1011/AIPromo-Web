import type { ApiResponse } from "../api";

export interface AssignAreaMapping {
    ticketTypeId: string;
    areaId: string;
}

export interface AssignAreasRequest {
    mappings: AssignAreaMapping[];
}

export type GetSeatMapResponse = {
    eventId: string;
    spec: string;
    eventSessionId: string;
}

export interface GetListSeatMapByCurrentOrganizerItem {
    eventId: string;
    title: string;
    spec: string;
}

export type GetListSeatMapByCurrentOrganizer = ApiResponse<GetListSeatMapByCurrentOrganizerItem[]>