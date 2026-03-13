import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import LockSeatTab from "./LockSeatTab";
import TicketSummary from "../../components/Organizer/ticket/TicketSummary";
import TicketTypeList from "../../components/Organizer/ticket/TicketTypeList";

type TabKey = "overview" | "lock-seat";

export default function EventTicketPage() {
    const [tab, setTab] = useState<TabKey>("overview");

    const [quantities, setQuantities] = useState<Record<string, number>>({
        FREE: 0,
        "100k": 0,
        "200k": 0,
    });

    const updateQuantity = (key: string, delta: number) => {
        setQuantities(prev => ({
            ...prev,
            [key]: Math.max(0, prev[key] + delta),
        }));
    };

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
                            <span className="px-4 py-2 rounded-full bg-white/5 text-sm text-slate-300">
                                <FiCalendar className="inline mr-2 my-auto" /> 27 Tháng 01, 2026 – 00:00
                            </span>

                            <button className="text-primary text-sm">
                                Đổi suất diễn
                            </button>
                        </div>

                        <TicketTypeList
                            quantities={quantities}
                            onChange={updateQuantity}
                        />
                    </div>

                    <TicketSummary quantities={quantities} />
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
