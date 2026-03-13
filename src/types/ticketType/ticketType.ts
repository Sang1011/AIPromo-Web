export interface CreateTicketTypeRequest {
    name: string;
    price: number;
}

export interface UpdateTicketTypeRequest {
    name: string;
    price: number;
}

export interface AssignAreaRequest {
    areaId: string;
}

export interface TicketTypeItem {
    id: string;
    name: string;
    price: number;
    areaId: string | null;
    areaName: string | null;
    areaType: string | null;
}

export type CreateTicketTypeResponse = string;

export type GetAllTicketTypesResponse = TicketTypeItem[];