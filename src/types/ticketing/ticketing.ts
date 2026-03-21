export interface CreatePendingOrderRequest {
    tickets: TicketRequest[];
}

export interface TicketRequest {
    eventSessionId: string;
    ticketTypeId: string;
    seatId?: string;
}