import { useEffect, useState } from "react";
import EventCard, { type EventItemMapUI, type EventStatusUI } from "../../components/Organizer/events/EventCards";
import SearchBar from "../../components/Organizer/shared/SearchBar";
import StatusFilters, { type FilterStatus } from "../../components/Organizer/shared/StatusFilter";
import Pagination from "../../components/Organizer/shared/Pagination";
import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutConfig } from "../../types/organizer/dashboard.config";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchAllEventsByMe } from "../../store/eventSlice";
import { mapStatus } from "../../utils/mapStatus";
import type { EventStatus } from "../../types/event/event";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

export default function MyEventsPage() {
    const { setConfig } = useOutletContext<DashboardContext>();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("upcoming");
    const [currentPage, setCurrentPage] = useState(1);

    const dispatch = useDispatch<AppDispatch>();
    const { events, pagination } = useSelector((state: RootState) => state.EVENT);

    const mapEvent = (event: any): EventItemMapUI => {
        const status = mapStatus(event.status);

        return {
            id: event.id,
            title: event.title,
            image: event.bannerUrl,
            location: event.location,
            time: new Date(event.eventStartAt).toLocaleString("vi-VN"),
            status: status.status as EventStatusUI,
            statusLabel: status.label,
            category: event.categories?.[0]?.name
        };
    };

    useEffect(() => {
        setConfig({
            title: "Sự kiện của tôi",
            havePromoSidebar: true,
        });

        return () => setConfig({});
    }, []);

    useEffect(() => {
        dispatch(
            fetchAllEventsByMe({
                PageNumber: currentPage,
                PageSize: 5,
                Status: activeFilter
            })
        );
    }, [dispatch, currentPage, activeFilter]);

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
                    onFilterChange={setActiveFilter}
                />
            </div>

            <div className="space-y-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={mapEvent(event)} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
