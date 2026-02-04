import { useState } from "react";
import { FiCalendar, FiChevronDown, FiPlus } from "react-icons/fi";
import TicketRow from "./TicketRow";

export default function ScheduleCard({
    schedule,
    onAddTicket,
}: any) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">

            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <FiCalendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-semibold text-white">
                            {schedule.date}
                        </p>
                        <p className="text-xs text-slate-400">
                            {schedule.time} • {schedule.tickets.length} Loại vé
                        </p>
                    </div>
                </div>

                <FiChevronDown
                    className={`transition ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="px-6 pb-6 space-y-4 border-t border-white/5">

                    {/* Table header */}
                    <div className="flex text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-4">
                        <div className="flex-1">Tên loại vé</div>
                        <div className="w-28 text-center">Giá</div>
                        <div className="w-28 text-center">Số lượng</div>
                        <div className="w-28 text-right">Thao tác</div>
                    </div>

                    {schedule.tickets.map((t: any) => (
                        <TicketRow key={t.id} ticket={t} />
                    ))}

                    <button
                        onClick={onAddTicket}
                        className="
                            w-full py-3.5
                            border-2 border-dashed border-white/10
                            rounded-xl
                            text-slate-400
                            hover:text-primary hover:border-primary/40
                            flex items-center justify-center gap-2
                        "
                    >
                        <FiPlus />
                        Tạo loại vé mới
                    </button>
                </div>
            )}
        </div>
    );
}
