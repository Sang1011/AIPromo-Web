export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    message: string | null;
    timestamp: string;
}

export interface ApiResponseNoData {
    isSuccess: boolean;
    message: string | null;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    items: T[];
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

export const ORDER_ERROR_MESSAGES: Record<string, string> = {
    'Order.NotFound': 'Không tìm thấy đơn hàng.',
    'Order.CannotMarkPaid': 'Không thể xác nhận thanh toán. Trạng thái đơn hàng không hợp lệ.',
    'Order.CannotCancel': 'Không thể huỷ đơn hàng. Trạng thái đơn hàng không hợp lệ.',
    'Order.NoTickets': 'Đơn hàng phải có ít nhất một vé.',
    'Order.InvalidTotalPrice': 'Tổng tiền không hợp lệ.',
    'Order.CannotCancelWithUsedTickets': 'Không thể huỷ vì đã có vé được sử dụng.',
    'Order.InvalidTicketSelection': 'Lựa chọn vé không hợp lệ.',
    'Order.TicketNotPurchasable': 'Vé đã không còn mở bán',
    'Order.SeatRequired': 'Vui lòng chọn ghế cụ thể cho loại vé này.',
    'Order.SeatMustBeNullForZone': 'Loại vé theo khu vực không cần chọn ghế.',
    'Order.SeatNotFound': 'Không tìm thấy ghế đã chọn.',
    'Order.SeatNotBelongToArea': 'Ghế không thuộc khu vực của loại vé này.',
    'Order.SeatNotAvailable': 'Ghế đã chọn không còn trống.',
    'Order.ZoneSoldOut': 'Khu vực vé đã hết chỗ.',
    'Order.NotPaid': 'Đơn hàng chưa được thanh toán.',
    'Order.NotPending': 'Đơn hàng không ở trạng thái chờ thanh toán.',
};