import { useState } from "react";
import ManagementLayout from "./ManagementLayout";
import TicketTypeList from "./TicketTypeList";
import TicketSummary from "./TicketSummary";
import { FiCalendar } from "react-icons/fi";

export default function TicketQuantityPage() {
    const [quantities, setQuantities] = useState<Record<string, number>>({
        FREE: 0,
        "100k": 0,
        "200k": 0,
    });

    const updateQuantity = (key: string, delta: number) => {
        setQuantities((prev) => ({
            ...prev,
            [key]: Math.max(0, prev[key] + delta),
        }));
    };

    return (
        <ManagementLayout>
            <div className="flex gap-8 max-w-[1400px] mx-auto py-10">
                {/* Main */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="px-4 py-2 rounded-full bg-white/5 text-sm text-slate-300">
                            <FiCalendar className="mr-2 inline-block" /> 27 Tháng 01, 2026 – 00:00
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

                {/* Sidebar */}
                <TicketSummary quantities={quantities} />
            </div>
        </ManagementLayout>
    );
}
