import { useEffect, useState } from "react";
import EventCard, {
    type EventItemMapUI,
    type EventStatusUI,
} from "../../components/Organizer/events/EventCards";
import SearchBar from "../../components/Organizer/shared/SearchBar";
import StatusFilters, {
    type FilterStatus,
} from "../../components/Organizer/shared/StatusFilter";
import Pagination from "../../components/Organizer/shared/Pagination";
import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllEventsByMe } from "../../store/eventSlice";
import { convertFilterToApiStatus, mapStatus } from "../../utils/mapStatus";
import type { EventItemByMe } from "../../types/event/event";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

export default function MyEventsPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { myEvents, pagination: myEventsPagination } = useSelector(
        (state: RootState) => state.EVENT
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("Draft");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredEvents = myEvents.filter((event) =>
        event.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const formatDate = (date: string | null) => {
        if (!date) return "Chưa xác định";
        return new Date(date).toLocaleString("vi-VN");
    };
    const formatRange = (start: string | null, end: string | null) => {
        if (!start && !end) return "Chưa có thời gian";
        if (!start) return `Đến ${formatDate(end)}`;
        if (!end) return `Từ ${formatDate(start)}`;
        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    const mapEvent = (event: EventItemByMe): EventItemMapUI => {
        const status = mapStatus(event.status);

        const getReasonInfo = () => {
            switch (event.status) {
                case "Draft":
                    return event.publishRejectionReason
                        ? { reason: event.publishRejectionReason, label: "Từ chối duyệt", color: "red" as const }
                        : undefined;
                case "Suspended":
                    return event.suspensionReason
                        ? { reason: event.suspensionReason, label: "Lý do trì hoãn", color: "cyan" as const }
                        : undefined;
                case "Cancelled":
                    return event.cancellationReason
                        ? { reason: event.cancellationReason, label: "Lý do huỷ", color: "red" as const }
                        : undefined;
                case "PendingCancellation":
                    return event.cancellationRejectionReason
                        ? { reason: event.cancellationRejectionReason, label: "Từ chối huỷ", color: "orange" as const }
                        : undefined;
                default:
                    return undefined;
            }
        };

        const reasonInfo = getReasonInfo();

        return {
            id: event.id,
            title: event.title,
            image: event.bannerUrl,
            location: event.location,
            time: formatRange(event.eventStartAt, event.eventEndAt),
            status: status.status as EventStatusUI,
            statusLabel: status.label,
            color: status.color,
            statusCheck: event.status,
            rejectReason: reasonInfo?.reason,
            rejectReasonLabel: reasonInfo?.label,
            rejectColor: reasonInfo?.color,
        };
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setLoading(false);
    }, [myEvents]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        setConfig({
            title: "Sự kiện của tôi",
            havePromoSidebar: true,
        });

        return () => setConfig({});
    }, [setConfig]);

    useEffect(() => {
        setLoading(true);

        dispatch(
            fetchAllEventsByMe({
                PageNumber: currentPage,
                PageSize: 5,
                Statuses: convertFilterToApiStatus(activeFilter),
            })
        );
    }, [dispatch, currentPage, activeFilter]);

    const EventCardSkeleton = () => (
        <div className="flex gap-4 p-4 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
            <div className="w-40 h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />

            <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Tìm kiếm sự kiện của bạn..."
                />
                <StatusFilters
                    activeFilter={activeFilter}
                    onFilterChange={(filter) => {
                        setActiveFilter(filter);
                        setCurrentPage(1);
                    }}
                />
            </div>

            <div className="space-y-6">
                {loading ? (
                    [...Array(5)].map((_, i) => <EventCardSkeleton key={i} />)
                ) : filteredEvents.length === 0 ? (
                    <p className="text-slate-400 text-center">
                        Không có sự kiện nào
                    </p>
                ) : (
                    filteredEvents.map((event) => (
                        <EventCard key={event.id} event={mapEvent(event)} />
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={myEventsPagination?.totalPages || 1}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

