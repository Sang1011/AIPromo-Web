export interface GetAllOrderRequest {
    CategoryId?:number,
    PageNumber?: number;
    PageSize?: number;
    SortColumn?: string;
    SortOrder?: string;
}

export interface OrderItem {
  orderId: string;
  eventId: string;
  eventTitle: string;
  bannerUrl: string | null;
  status: "Pending" | "Completed" | "Cancelled "; 
  totalPrice: number;
  totalTickets: number;
  discountAmount: number | null;
}

export interface GetAllOrderResponse {
  items: OrderItem[];
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