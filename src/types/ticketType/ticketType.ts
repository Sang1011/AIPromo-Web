import type { ApiResponse } from "../api";

export interface CreateTicketTypeRequest {
    name: string;
    price: number;
    quantity: number;
}

export interface UpdateTicketTypeRequest {
    name: string;
    price: number;
    quantity: number;
}

export interface AssignAreaRequest {
    areaId: string;
}

export interface TicketTypeItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    soldQuantity: number;
    areaId: string | null;
    areaName: string | null;
    areaType: string | null;
    color?: string;
}

export type CreateTicketTypeResponse = string;

export type GetAllTicketTypesResponse = ApiResponse<TicketTypeItem[]>;