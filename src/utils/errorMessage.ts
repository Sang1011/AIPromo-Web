import { ORDER_ERROR_MESSAGES } from "../types/api";

export function getOrderErrorMessage(payload: any): string {
    const code = payload?.title;
    if (code && ORDER_ERROR_MESSAGES[code]) return ORDER_ERROR_MESSAGES[code];
    return payload?.detail ?? payload?.message ?? 'Tạo đơn hàng thất bại, vui lòng thử lại.';
}