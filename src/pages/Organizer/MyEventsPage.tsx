import { useState } from "react";
import DashboardLayout from "../../components/Organizer/DashboardLayout";
import EventCard, { type EventItem } from "../../components/Organizer/EventCards";
import SearchBar from "../../components/Organizer/SearchBar";
import StatusFilters, { type FilterStatus } from "../../components/Organizer/StatusFilter";
import Pagination from "../../components/Organizer/Pagination";

const EVENTS: EventItem[] = [
    {
        title: "Hội thảo AI & Future Marketing 2026",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBbqTPIvST5wyGH_GDv-StIHdwyxGkh-45_855gQ9zT64S5Cy8ojzu44Xlc5S2WB93Vu7uqYYlSCQfXBDvxYKjlhC15-S7GHjWMzHZN2eJyBUBgBeHGXHYx9RE0pnyPYQamfNxgXgu5-OLDVo_2AkcrO046Ilhyr7BwwuCINlO26Z1idLmMJZJLW2hVv9IX4vm6TQ_Y0HoCUwvXiLd38bmngAA650M2_ETYFxyOBrkFTEJbWT5FpQEPpOyEW_krtQs5ct2BPhPayj8",
        time: "09:00, Thứ 3, 27 Tháng 01 2026",
        location: "FPT University, D1, Thủ Đức, TP. Hồ Chí Minh",
        status: "live",
        statusLabel: "Đang diễn ra",
        category: "Hội thảo",
    },
    {
        title: "Tech Summit 2026: The New Era",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBk9FZumaMgZCEALIbF-Jx3g7lvKtihKFRJP1SnwaHb0jjC7kD1D5lNUdv3DHOT7LgUSCuLDxSvlH8EKF8mVhi9AM1s6b_qvLcJcqjG1i2GUzAOrVh3T12ntEQ2e4UCzlcFM95QA6DcMl7Ze2fj5MCqpwcotOSZ-L5HGuLqJXAk8Q4_7aXpri8iTcQ8zEGiAJB8uIIdNUWftUpsutAjFULCf_XNQ-middtIpfZekxGHCPNfBMVs7amtmqjdacYjwvAHxYMDu-YFt0k",
        time: "20:00, Thứ 7, 15 Tháng 02 2026",
        location: "SECC, Quận 7, TP. Hồ Chí Minh",
        status: "upcoming",
        statusLabel: "Sắp diễn ra",
        category: "Sự kiện",
    },
];

export default function MyEvents() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterStatus>("upcoming");
    const [currentPage, setCurrentPage] = useState(1);

    return (
        <DashboardLayout title="Sự kiện của tôi" havePromoSidebar={true}>
            <div className="space-y-8">
                {/* Search and Filters */}
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

                {/* Event List */}
                <div className="space-y-6">
                    {EVENTS.map((event, index) => (
                        <EventCard key={index} event={event} />
                    ))}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={3}
                    onPageChange={setCurrentPage}
                />
            </div>
        </DashboardLayout>
    );
}