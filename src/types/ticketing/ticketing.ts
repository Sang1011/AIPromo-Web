export interface CreatePendingOrderRequest {
    eventId: string,
    tickets: TicketRequest[];
}

export interface TicketRequest {
    eventSessionId: string;
    ticketTypeId: string;
    seatId?: string;
}