export interface CreatePendingOrderRequest {
    eventId: string,
    tickets: TicketRequest[];
}

export interface TicketRequest {
    eventSessionId: string;
    ticketTypeId: string;
    seatId?: string;
}

export interface OrderItemOrganizer {
    orderId: string;
    createdAt: string;
    buyerName: string;
    buyerEmail: string;
    totalPrice: number;
    originalPrice: number;
    voucherCode: string;
    discountAmount: number;
    status: string;
}

export interface PaginatedOrders {
    items: OrderItemOrganizer[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    currentPageSize: number;
    currentStartIndex: number;
    currentEndIndex: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface GetOrdersRequest {
    eventId: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
}