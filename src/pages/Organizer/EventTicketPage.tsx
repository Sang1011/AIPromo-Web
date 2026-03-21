import { useEffect, useState } from "react";
import LockSeatTab from "./LockSeatTab";
import TicketSummary from "../../components/Organizer/ticket/TicketSummary";
import TicketTypeList from "../../components/Organizer/ticket/TicketTypeList";
import { useParams } from "react-router-dom";
import { fetchGetAllTicketTypes } from "../../store/ticketTypeSlice";
import type { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";

type TabKey = "overview" | "lock-seat";

export default function EventTicketPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const [tab, setTab] = useState<TabKey>("overview");
    const dispatch = useDispatch<AppDispatch>();
    const { ticketTypes } = useSelector((state: RootState) => state.TICKET_TYPE)
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const updateQuantity = (key: string, delta: number) => {
        const ticket = ticketTypes.find(t => t.id === key);
        if (!ticket) return;

        setQuantities(prev => {
            const current = prev[key] ?? 0;
            const next = current + delta;

            return {
                ...prev,
                [key]: Math.min(ticket.quantity, Math.max(0, next)),
            };
        });
    };

    useEffect(() => {
        if (!eventId) return;

        dispatch(fetchGetAllTicketTypes({ eventId }));
    }, [eventId, dispatch]);

    useEffect(() => {
        if (!ticketTypes) return;

        const initialQuantities: Record<string, number> = {};

        ticketTypes.forEach((ticket) => {
            initialQuantities[ticket.id] = 0;
        });

        setQuantities(initialQuantities);
    }, [ticketTypes]);

    return (
        <div className="space-y-8">
            {/* TAB HEADER */}
            <div className="flex gap-2 border-b border-white/10">
                <TabButton
                    active={tab === "overview"}
                    onClick={() => setTab("overview")}
                >
                    Tổng quan
                </TabButton>

                <TabButton
                    active={tab === "lock-seat"}
                    onClick={() => setTab("lock-seat")}
                >
                    Khóa ghế
                </TabButton>
            </div>

            {/* TAB CONTENT */}
            {tab === "overview" && (
                <div className="flex gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                        </div>

                        {ticketTypes.length === 0 ? (
                            <div className="rounded-2xl border border-white/5 bg-[#0b0816] p-8 text-center text-slate-400">
                                Chưa tạo vé cho sự kiện này
                            </div>
                        ) : (
                            <TicketTypeList
                                ticketTypes={ticketTypes}
                                quantities={quantities}
                                onChange={updateQuantity}
                            />
                        )}
                    </div>

                    <TicketSummary ticketTypes={ticketTypes} quantities={quantities} />
                </div>
            )}

            {tab === "lock-seat" && <LockSeatTab />}
        </div>
    );
}

function TabButton({
    active,
    children,
    onClick,
}: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
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
