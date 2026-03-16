export interface AssignAreaMapping {
    ticketTypeId: string;
    areaId: string;
}

export interface AssignAreasRequest {
    mappings: AssignAreaMapping[];
}