import { useEffect, useState } from "react";
import EventCard, {
    type EventItemMapUI,
    type EventStatusUI,
} from "../../components/Organizer/events/EventCards";
import SearchBar from "../../components/Organizer/shared/SearchBar";
import StatusFilters, {
    type FilterStatus,
} from "../../components/Organizer/shared/StatusFilters";
import Pagination from "../../components/Organizer/shared/Pagination";
import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllEventsByMe } from "../../store/eventSlice";
import { fetchMe } from "../../store/authSlice";
import { fetchEventListAssignedForCurrentUser } from "../../store/eventMemberSlice";
import { convertFilterToApiStatus, mapStatus } from "../../utils/mapStatus";
import type { EventItemByMe } from "../../types/event/event";
import type { EventItemByEventMember } from "../../types/eventMember/eventMember";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

const formatDate = (date: string | null) => {
    if (!date) return "Chưa xác định";
    return new Date(date).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

const formatRange = (start: string | null, end: string | null) => {
    if (!start && !end) return "Chưa có thời gian";
    if (!start) return `Đến ${formatDate(end)}`;
    if (!end) return `Từ ${formatDate(start)}`;
    return `${formatDate(start)} - ${formatDate(end)}`;
};

/** Map EventItemByMe → EventItemMapUI (organizer view) */
const mapOrganizerEvent = (event: EventItemByMe): EventItemMapUI => {
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

/** Map EventItemByEventMember → EventItemMapUI (member view, tất cả đều Published) */
const mapMemberEvent = (event: EventItemByEventMember): EventItemMapUI => {
    // Lấy thời gian từ session đầu tiên nếu có, fallback về eventStartAt/eventEndAt
    const firstSession = event.sessions?.[0];
    const time = firstSession
        ? formatRange(firstSession.startTime, firstSession.endTime)
        : formatRange(event.eventStartAt, event.eventEndAt);

    return {
        id: event.eventId,
        title: event.title,
        image: event.bannerUrl,
        location: "",           // EventItemByEventMember không có location
        time,
        status: "upcoming",     // assigned events đều là Published
        statusLabel: "Đang mở",
        color: "emerald",
        statusCheck: "Published",
        sessions: event.sessions?.map((s) => ({
            id: s.id,
            title: s.title,
            startTime: s.startTime,
            endTime: s.endTime,
        })),
        permissions: event.permissions
    };
};

export default function MyEventsPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const dispatch = useDispatch<AppDispatch>();

    const { currentInfor } = useSelector((state: RootState) => state.AUTH);
    const { myEvents, pagination: myEventsPagination } = useSelector((state: RootState) => state.EVENT);
    const { assignedEvents, fetchingAssignedEvents } = useSelector((state: RootState) => state.EVENT_MEMBER);

    const [loadingOrganizer, setLoadingOrganizer] = useState(false);
    const [roleResolved, setRoleResolved] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("Draft");
    const [currentPage, setCurrentPage] = useState(1);

    // Roles — đọc từ currentInfor sau khi fetchMe xong
    const roles: string[] = (currentInfor as any)?.roles ?? [];
    const isOrganizer = roles.includes("Organizer");

    // 1. Luôn fetchMe để đảm bảo role mới nhất
    useEffect(() => {
        dispatch(fetchMe()).finally(() => setRoleResolved(true));
    }, [dispatch]);

    // 2. Sau khi biết role, fetch data tương ứng
    useEffect(() => {
        if (!roleResolved) return;

        if (isOrganizer) {
            setLoadingOrganizer(true);
            dispatch(
                fetchAllEventsByMe({
                    PageNumber: currentPage,
                    PageSize: 5,
                    Statuses: convertFilterToApiStatus(activeFilter),
                })
            ).finally(() => setLoadingOrganizer(false));
        } else {
            dispatch(fetchEventListAssignedForCurrentUser());
        }
    }, [dispatch, roleResolved, isOrganizer, currentPage, activeFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [debouncedSearch]);

    useEffect(() => {
        setConfig({
            title: isOrganizer ? "Sự kiện của tôi" : "Sự kiện được phân công",
            havePromoSidebar: true,
        });
        return () => setConfig({});
    }, [setConfig, isOrganizer]);

    // ─── Build display list ───────────────────────────────────────────────────

    const organizerList: EventItemMapUI[] = myEvents
        .filter((e) => e.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))
        .map(mapOrganizerEvent);

    const memberList: EventItemMapUI[] = assignedEvents
        .filter((e) => e.title?.toLowerCase().includes(debouncedSearch.toLowerCase()))
        .map(mapMemberEvent);

    const displayList = isOrganizer ? organizerList : memberList;
    const isLoading = isOrganizer ? loadingOrganizer : fetchingAssignedEvents;
    const showPagination = isOrganizer; // member list không có pagination từ API

    // ─── Skeleton ─────────────────────────────────────────────────────────────

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

    // Chưa resolve role thì show loading toàn trang
    if (!roleResolved) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={isOrganizer ? "Tìm kiếm sự kiện của bạn..." : "Tìm kiếm sự kiện..."}
                />
                {/* StatusFilters chỉ show cho Organizer */}
                {isOrganizer && (
                    <StatusFilters
                        activeFilter={activeFilter}
                        onFilterChange={(filter) => {
                            setActiveFilter(filter);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    [...Array(5)].map((_, i) => <EventCardSkeleton key={i} />)
                ) : displayList.length === 0 ? (
                    <p className="text-slate-400 text-center">Không có sự kiện nào</p>
                ) : (
                    displayList.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            isMember={!isOrganizer}
                        />
                    ))
                )}
            </div>

            {showPagination && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={myEventsPagination?.totalPages || 1}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}