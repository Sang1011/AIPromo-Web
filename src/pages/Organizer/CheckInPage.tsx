import { useEffect, useState } from "react";
import CheckinOverview from "../../components/Organizer/checkin/CheckinOverview";
import TicketSummaryTable from "../../components/Organizer/ticket/TicketSummaryTable";
import TicketTypeBarChart from "../../components/Organizer/overview/ticketTypeBarChart";
import { fetchCheckInOrganizerStats } from "../../store/ticketingSlice";
import { fetchSessions } from "../../store/eventSlice";
import type { CheckInStatistic } from "../../types/ticketing/ticketing";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import CheckInPageSkeleton from "../../components/Organizer/checkin/CheckinPageSekeleton";
import { useCheckInRealtime } from "../../hooks/useCheckInRealtime";

export default function CheckInPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    const reduxSessions = useSelector((state: RootState) => state.EVENT.sessions);
    const reduxData = useSelector((state: RootState) => state.TICKETING);

    const sessions = reduxSessions;
    const loading = reduxData.loading;

    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    // Realtime stats — bắt đầu bằng Redux data, SignalR sẽ patch lên sau
    const [realtimeStats, setRealtimeStats] = useState<CheckInStatistic | null>(null);

    // Khi Redux load xong lần đầu → sync vào local state
    useEffect(() => {
        if (reduxData.checkInStats) {
            setRealtimeStats(reduxData.checkInStats);
        }
    }, [reduxData.checkInStats]);

    // Kết nối SignalR theo eventId, cập nhật stats realtime
    useCheckInRealtime({
        eventId,
        onUpdate: (stats) => {
            setRealtimeStats(stats);
        },
    });

    useEffect(() => {
        if (eventId) {
            dispatch(fetchSessions(eventId));
        }
    }, [eventId, dispatch]);

    useEffect(() => {
        if (sessions.length > 0 && !selectedSessionId) {
            setSelectedSessionId(sessions[0].id);
        }
    }, [sessions]);

    useEffect(() => {
        if (!eventId || !selectedSessionId) return;
        dispatch(fetchCheckInOrganizerStats({ eventId, sessionId: selectedSessionId }));
    }, [eventId, selectedSessionId, dispatch]);

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSessionId = e.target.value;
        setSelectedSessionId(newSessionId);
        // Reset realtime khi đổi session để tránh hiển thị data cũ
        setRealtimeStats(null);
    };

    const checkInStats = realtimeStats;

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

                    <TicketTypeBarChart breakdown={checkInStats.ticketStats} />

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