import type { EventStatus } from "../types/event/event";

export const STATUS_MAP: Record<EventStatus, { status: string; label: string }> = {
    Draft: { status: "draft", label: "Bản nháp" },
    PendingReview: { status: "draft", label: "Chờ duyệt" },
    Published: { status: "upcoming", label: "Sắp diễn ra" },
    Unpublished: { status: "draft", label: "Ngừng hiển thị" },
    PendingCancellation: { status: "draft", label: "Chờ huỷ" },
    Cancelled: { status: "ended", label: "Đã huỷ" },
    Completed: { status: "ended", label: "Đã kết thúc" }
};

export function mapStatus(status: EventStatus) {
    return STATUS_MAP[status] ?? { status: "draft", label: status };
}