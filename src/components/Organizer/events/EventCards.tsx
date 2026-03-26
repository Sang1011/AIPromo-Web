import {
    FiCalendar,
    FiMapPin,
    FiEdit,
    FiEye
} from "react-icons/fi";
import { MdDashboard, MdEventSeat, MdGroup, MdShoppingCart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import type { EventStatus } from "../../../types/event/event";

export type EventStatusUI = "draft" | "pending" | "upcoming" | "past" | "suspend";

export interface EventItemMapUI {
    id: string;
    title: string;
    image: string;
    time: string;
    location: string;
    status: EventStatusUI;
    statusLabel: string;
    category?: string;
    color?: string;
    statusCheck: EventStatus;
}

interface EventCardProps {
    event: EventItemMapUI;
}

const COLOR_CLASS = {
    slate: "text-slate-500 bg-slate-500/10",
    cyan: "text-cyan-500 bg-cyan-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10",
    gray: "text-gray-500 bg-gray-500/10",
};

export default function EventCard({ event }: EventCardProps) {
    const navigate = useNavigate();

    const goToEvent = (eventId: string, sub: string) => {
        navigate(`/organizer/my-events/${eventId}/${sub}`);
    };

    return (
        <div className="glass rounded-3xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="p-6 flex gap-6">
                <div className="w-48 h-32 rounded-2xl overflow-hidden relative">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {event.category && (
                        <span className="absolute bottom-3 left-3 bg-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            {event.category}
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold dark:text-white group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>

                        <span
                            className={`flex items-center gap-1 text-xs font-bold uppercase px-3 py-1 rounded-full
                                        ${COLOR_CLASS[event.color as keyof typeof COLOR_CLASS]}`}
                        >
                            {event.status === "upcoming" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}

                            {event.status === "pending" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            )}

                            {event.statusLabel}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="text-sm" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-sm" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex gap-4">
                    <FooterButton icon={<MdDashboard />} label="Tổng quan" onClick={() => goToEvent(event.id, "overview")} />
                    <FooterButton icon={<MdGroup />} label="Thành viên" onClick={() => goToEvent(event.id, "members")} />
                    <FooterButton icon={<MdShoppingCart />} label="Đơn hàng" onClick={() => goToEvent(event.id, "orders")} />
                    <FooterButton icon={<MdEventSeat />} label="Sơ đồ" onClick={() => goToEvent(event.id, "seat-map")} />
                </div>
                {event.statusCheck === "Draft" || event.statusCheck === "Suspended" ? (
                    <button onClick={() => goToEvent(event.id, "edit")} className="bg-slate-100 dark:bg-white/5 hover:bg-primary/20 text-slate-600 dark:text-slate-300 hover:text-primary px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                        <FiEdit className="text-lg" />
                        <span className="text-sm font-semibold">Chỉnh sửa</span>
                    </button>
                ) : (
                    <button onClick={() => goToEvent(event.id, "edit")} className="bg-slate-100 dark:bg-white/5 hover:bg-primary/20 text-slate-600 dark:text-slate-300 hover:text-primary px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                        <FiEye className="text-lg" />
                        <span className="text-sm font-semibold">Xem chi tiết</span>
                    </button>
                )}
            </div>
        </div>
    );
}

function FooterButton({
    icon,
    label,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-all group/btn">
            <span className="text-xl group-hover/btn:scale-110 transition-transform">
                {icon}
            </span>
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </button>
    );
}