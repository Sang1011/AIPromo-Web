import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import TicketSummary from "../../components/Organizer/ticket/TicketSummary";
import TicketTypeList from "../../components/Organizer/ticket/TicketTypeList";
import type { AppDispatch, RootState } from "../../store";
import { fetchEventById } from "../../store/eventSlice";
import { fetchGetAllTicketTypes } from "../../store/ticketTypeSlice";
import type { EventSession } from "../../types/event/event";
import LockSeatTab from "./LockSeatTab";

type TabKey = "overview" | "lock-seat";

export default function EventTicketPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const [tab, setTab] = useState<TabKey>("overview");
    const dispatch = useDispatch<AppDispatch>();
    const { ticketTypes } = useSelector((state: RootState) => state.TICKET_TYPE);

    const [sessions, setSessions] = useState<EventSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!eventId) return;
        dispatch(fetchEventById(eventId))
            .unwrap()
            .then((res) => {
                const eventSessions: EventSession[] = res.data?.sessions ?? [];
                setSessions(eventSessions);
                if (eventSessions[0]) setSelectedSessionId(eventSessions[0].id);
            });
    }, [eventId, dispatch]);

    // Fetch ticket types whenever session changes
    useEffect(() => {
        if (!eventId || !selectedSessionId) return;
        dispatch(fetchGetAllTicketTypes({ eventId, eventSessionId: selectedSessionId }));
    }, [eventId, selectedSessionId, dispatch]);

    useEffect(() => {
        if (!ticketTypes) return;
        const initial: Record<string, number> = {};
        ticketTypes.forEach((t) => { initial[t.id] = 0; });
        setQuantities(initial);
    }, [ticketTypes]);

    const handleSessionChange = (sessionId: string) => {
        setSelectedSessionId(sessionId);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 shrink-0">Suất diễn:</span>
                <div className="relative">
                    <select
                        value={selectedSessionId}
                        onChange={e => handleSessionChange(e.target.value)}
                        disabled={sessions.length === 0}
                        className="
                            appearance-none
                            bg-[#120c26] border border-white/10
                            text-white text-sm
                            rounded-xl px-4 py-2 pr-9
                            focus:outline-none focus:border-primary/50
                            cursor-pointer min-w-[220px]
                            disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {sessions.length === 0 ? (
                            <option value="">Không có suất diễn</option>
                        ) : (
                            sessions.map(session => (
                                <option key={session.id} value={session.id}>
                                    {session.title}
                                </option>
                            ))
                        )}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                </div>
            </div>

            {/* TAB HEADER */}
            <div className="flex gap-2 border-b border-white/10">
                <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
                    Tổng quan
                </TabButton>
                <TabButton active={tab === "lock-seat"} onClick={() => setTab("lock-seat")}>
                    Khóa ghế
                </TabButton>
            </div>

            {/* TAB CONTENT */}
            {tab === "overview" && (
                <div className="flex gap-8">
                    <div className="flex-1 space-y-6">
                        {(!ticketTypes || ticketTypes.length === 0) ? (
                            <div className="rounded-2xl border border-white/5 bg-[#0b0816] p-8 text-center text-slate-400">
                                Chưa tạo vé cho sự kiện này
                            </div>
                        ) : (
                            <TicketTypeList
                                ticketTypes={ticketTypes}
                            />
                        )}
                    </div>
                    <TicketSummary ticketTypes={ticketTypes} quantities={quantities} />
                </div>
            )}

            {tab === "lock-seat" && (
                <LockSeatTab
                    selectedSessionId={selectedSessionId}
                />
            )}
        </div>
    );
}

function TabButton({ active, children, onClick }: {
    active: boolean; children: React.ReactNode; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition
                ${active
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
        >
            {children}
        </button>
    );
}