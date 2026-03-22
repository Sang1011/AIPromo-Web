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