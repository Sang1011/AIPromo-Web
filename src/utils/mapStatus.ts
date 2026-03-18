import type { FilterStatus } from "../components/Organizer/shared/StatusFilter";
import type { EventStatus } from "../types/event/event";

export const STATUS_MAP: Record<
    EventStatus,
    { status: string; label: string; color: string }
> = {
    Draft: { status: "draft", label: "Bản nháp", color: "slate" },
    PendingReview: { status: "pending", label: "Chờ duyệt", color: "blue" },
    Published: { status: "upcoming", label: "Đang hoạt động", color: "amber" },
    Suspended: { status: "suspend", label: "Trì hoãn", color: "cyan" },
    PendingCancellation: { status: "pending", label: "Chờ huỷ", color: "orange" },
    Cancelled: { status: "past", label: "Đã huỷ", color: "red" },
    Completed: { status: "past", label: "Đã kết thúc", color: "emerald" }
};

export function mapStatus(status: EventStatus) {
    return (
        STATUS_MAP[status] ?? {
            status: "draft",
            label: status,
            color: "slate"
        }
    );
}

export const FILTER_TO_API_STATUS: Record<FilterStatus, EventStatus[]> = {
    Draft: ["Draft"],

    Pending: ["PendingReview", "PendingCancellation"],

    Upcoming: ["Published"],

    Past: ["Completed", "Cancelled"],

    Suspend: ["Suspended"]
};

export function convertFilterToApiStatus(filter: FilterStatus): string {
    const statuses = FILTER_TO_API_STATUS[filter];

    return statuses
        .map((s) => s.toLowerCase())
        .join(",");
}