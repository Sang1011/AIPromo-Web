import { useEffect, useState } from "react";
import CheckinOverview from "../../components/Organizer/checkin/CheckinOverview";
import TicketSummaryTable from "../../components/Organizer/ticket/TicketSummaryTable";
import { fetchCheckInOrganizerStats } from "../../store/ticketingSlice";
import { fetchSessions } from "../../store/eventSlice";
import type { StatisticCheckInResponse } from "../../types/ticketing/ticketing";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { EventSession } from "../../types/event/event";
import CheckInPageSkeleton from "../../components/Organizer/checkin/CheckinPageSekeleton";

const mockSessions: EventSession[] = [
    {
        id: "session_1",
        title: "Buổi sáng - Khai mạc",
        description: "Chương trình khai mạc",
        startTime: "2026-04-10T08:00:00Z",
        endTime: "2026-04-10T10:00:00Z",
    },
    {
        id: "session_2",
        title: "Buổi chiều - Workshop",
        description: "Workshop chính",
        startTime: "2026-04-10T13:00:00Z",
        endTime: "2026-04-10T16:00:00Z",
    },
    {
        id: "session_3",
        title: "Buổi tối - Gala",
        description: "Đêm gala",
        startTime: "2026-04-10T18:00:00Z",
        endTime: "2026-04-10T21:00:00Z",
    },
];

const mockCheckInStats: StatisticCheckInResponse = {
    isSuccess: true,
    message: null,
    timestamp: new Date().toISOString(),
    data: {
        summary: {
            totalTicketTypes: 3,
            totalTicketQuantity: 500,
            totalSold: 420,
            totalCheckedIn: 350,
            checkInRate: Math.round((350 / 420) * 100),
        },
        ticketStats: [
            {
                ticketTypeId: "vip",
                ticketTypeName: "VIP",
                quantity: 100,
                sold: 90,
                checkedIn: 80,
            },
            {
                ticketTypeId: "standard",
                ticketTypeName: "Standard",
                quantity: 300,
                sold: 250,
                checkedIn: 210,
            },
            {
                ticketTypeId: "student",
                ticketTypeName: "Student",
                quantity: 100,
                sold: 80,
                checkedIn: 60,
            },
        ],
    },
};

const USE_MOCK = false;

export default function CheckInPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // Redux (giữ nguyên)
    const reduxSessions = useSelector((state: RootState) => state.EVENT.sessions);
    const reduxData = useSelector((state: RootState) => state.TICKETING);

    // Mock state
    const [mockStats, setMockStats] = useState<StatisticCheckInResponse["data"] | null>(null);
    const [mockLoading, setMockLoading] = useState(false);

    // Data source switch
    const sessions = USE_MOCK ? mockSessions : reduxSessions;
    const loading = USE_MOCK ? mockLoading : reduxData.loading;
    const checkInStats = USE_MOCK ? mockStats : reduxData.checkInStats;

    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    const fakeFetchCheckInStats = () => {
        return new Promise<StatisticCheckInResponse>((resolve) => {
            setTimeout(() => resolve(mockCheckInStats), 800);
        });
    };

    useEffect(() => {
        if (!USE_MOCK && eventId) {
            dispatch(fetchSessions(eventId));
        }
    }, [eventId, dispatch]);

    // Auto select session
    useEffect(() => {
        if (sessions.length > 0 && !selectedSessionId) {
            setSelectedSessionId(sessions[0].id);
        }
    }, [sessions]);

    // Fetch check-in stats (2 hướng song song)
    useEffect(() => {
        if (!eventId || !selectedSessionId) return;

        if (USE_MOCK) {
            setMockLoading(true);
            fakeFetchCheckInStats().then((res) => {
                setMockStats(res.data);
                setMockLoading(false);
            });
        } else {
            dispatch(fetchCheckInOrganizerStats({ eventId, sessionId: selectedSessionId }));
        }
    }, [eventId, selectedSessionId, dispatch]);

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSessionId(e.target.value);
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <CheckInPageSkeleton />
            ) : checkInStats ? (
                <>
                    <div className="flex items-center gap-4">
                        <label className="text-sm text-slate-400 whitespace-nowrap">
                            Chọn buổi diễn
                        </label>
                        <select
                            value={selectedSessionId}
                            onChange={handleSessionChange}
                            className="flex-1 max-w-sm bg-[#18122B] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                        >
                            {sessions.length === 0 && (
                                <option value="" disabled>
                                    Không có buổi diễn
                                </option>
                            )}
                            {sessions.map((session) => (
                                <option key={session.id} value={session.id}>
                                    {session.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <CheckinOverview summary={checkInStats.summary} />
                    <TicketSummaryTable ticketStats={checkInStats.ticketStats} />
                </>
            ) : (
                <div className="text-center py-20 text-slate-500 text-sm">
                    {selectedSessionId
                        ? "Không có dữ liệu cho buổi diễn này."
                        : "Vui lòng chọn một buổi diễn."}
                </div>
            )}

        </div>
    );
}