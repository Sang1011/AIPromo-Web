import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock,
    FiTag, FiLayers,
    FiAlertTriangle
} from "react-icons/fi";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchDeleteSession, fetchSessions } from "../../../store/eventSlice";
import type { EventSession } from "../../../types/event/event";
import CreateSessionModal from "../sessions/CreateSessionModal";
import EditSessionModal from "../sessions/EditSessionModal";
import TicketTypeModal from "../ticket/TicketTypeModal";
import { fetchGetAllTicketTypes } from "../../../store/ticketTypeSlice";
import type { TicketTypeItem } from "../../../types/ticketType/ticketType";
import { notify } from "../../../utils/notify";

const formatDateTime = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatPrice = (price: number) =>
    price === 0 ? "FREE" : price.toLocaleString("vi-VN") + "đ";

function SectionHeader({
    icon,
    title,
    subtitle,
    count,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    count?: number;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{title}</h3>
                        {count !== undefined && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                                {count}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                </div>
            </div>
            {action}
        </div>
    );
}

function SessionCard({
    session,
    onEdit,
    onDelete,
}: {
    session: EventSession & { id: string };
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc muốn xoá suất diễn "${session.title}"?`)) return;
        setDeleting(true);
        try { onDelete(); } finally { setDeleting(false); }
    };

    return (
        <div className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#18122B] border border-white/5 hover:border-primary/25 hover:bg-[#1e1638] transition-all duration-200">
            {/* Accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />

            {/* Info */}
            <div className="flex-1 min-w-0 pl-3">
                <p className="font-bold text-white text-sm truncate">{session.title}</p>
                {session.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5 max-w-sm">{session.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FiCalendar size={11} className="text-primary/60" />
                        {formatDateTime(session.startTime)}
                    </span>
                    <span className="text-slate-700 text-xs hidden sm:block">→</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FiClock size={11} className="text-primary/60" />
                        {formatDateTime(session.endTime)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all border border-white/5"
                >
                    <FiEdit2 size={12} />
                    Sửa
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 font-medium text-xs transition-all border border-red-500/10 disabled:opacity-50"
                >
                    <FiTrash2 size={12} />
                    {deleting ? "..." : "Xoá"}
                </button>
            </div>
        </div>
    );
}

function EmptySessions({ onCreate }: { onCreate: () => void }) {
    return (
        <div
            onClick={onCreate}
            className="group flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border border-dashed border-white/8 bg-white/[0.015] hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer"
        >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FiPlus size={18} />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">Tạo suất diễn đầu tiên</p>
                <p className="text-xs text-slate-600 mt-0.5">Nhấn để bắt đầu thiết lập lịch diễn</p>
            </div>
        </div>
    );
}

function TicketTypeRow({ ticket }: { ticket: TicketTypeItem }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#18122B] border border-white/5 hover:border-primary/20 transition-colors">
            {/* Color dot */}
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />

            {/* Name */}
            <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                    {ticket.name}
                </span>

                {/* Quantity */}
                <p className="text-[11px] text-slate-400 mt-1">
                    Số lượng: <span className="text-white font-medium">{ticket.quantity}</span>
                </p>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
                <span className="text-sm font-black text-primary">
                    {formatPrice(ticket.price)}
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">mỗi vé</p>
            </div>
        </div>
    );
}

function EmptyTickets({ onManage }: { onManage: () => void }) {
    return (
        <div className="rounded-2xl border border-border-dark-light bg-surface-dark/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-dark">

                <FiAlertTriangle className="text-bg-white w-5 h-5 shrink-0" />

                <p className="text-sm text-white font-semibold">
                    Sự kiện cần ít nhất 1 loại vé để có thể mở bán
                </p>
            </div>

            <button
                onClick={onManage}
                className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold
    bg-primary text-white
    hover:bg-primary/90
    transition-colors"
            >
                <FiPlus size={14} />
                Thiết lập loại vé ngay
            </button>
        </div>
    );
}

function Divider() {
    return (
        <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-white/5" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <div className="flex-1 h-px bg-white/5" />
        </div>
    );
}

export default function Step2Schedule({
    onNext,
    onBack,
}: {
    onNext: () => void;
    onBack: () => void;
}) {
    const dispatch = useDispatch<AppDispatch>();
    const { eventId } = useParams<{ eventId: string }>();

    const sessions = (useSelector(
        (state: RootState) => state.EVENT.sessions
    ) ?? []) as (EventSession & { id: string })[];

    const ticketTypes = useSelector(
        (state: RootState) => state.TICKET_TYPE.ticketTypes
    );

    const [loading, setLoading] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [editingSession, setEditingSession] = useState<(EventSession & { id: string }) | null>(null);
    const [openTicketModal, setOpenTicketModal] = useState(false);

    const loadSessions = () => {
        if (!eventId) return;
        setLoading(true);
        dispatch(fetchSessions(eventId)).finally(() => setLoading(false));
    };

    useEffect(() => { loadSessions(); }, [eventId]);

    const handleDelete = async (sessionId: string) => {
        if (!eventId) return;
        try {
            await dispatch(fetchDeleteSession({ eventId, sessionId })).unwrap();
            notify.success("Đã xoá suất diễn");
        } catch {
            notify.error("Không thể xoá suất diễn");
        }
    };

    const hasSessions = sessions.length > 0;
    const hasTickets = ticketTypes.length > 0;

    useEffect(() => {
        if (eventId) dispatch(fetchGetAllTicketTypes({ eventId }));
    }, [eventId]);

    return (
        <div className="space-y-8 max-w-3xl mx-auto">

            <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Thời gian biểu & Loại vé</h2>
                <p className="text-sm text-slate-500 mt-1">Thiết lập các suất diễn và hạng vé cho sự kiện.</p>
            </div>

            <div className="rounded-2xl bg-[#100d1f] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiLayers size={16} />}
                    title="Suất diễn"
                    subtitle="Các khung giờ diễn ra sự kiện"
                    count={sessions.length}
                    action={
                        <button
                            onClick={() => setOpenCreateModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors"
                        >
                            <FiPlus size={13} />
                            Tạo suất diễn
                        </button>
                    }
                />

                {loading ? (
                    <div className="py-10 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : hasSessions ? (
                    <div className="space-y-2">
                        {sessions.map((s) => (
                            <SessionCard
                                key={s.id}
                                session={s}
                                onEdit={() => setEditingSession(s)}
                                onDelete={() => handleDelete(s.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptySessions onCreate={() => setOpenCreateModal(true)} />
                )}
            </div>

            <Divider />

            <div className="rounded-2xl bg-[#100d1f] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiTag size={16} />}
                    title="Loại vé"
                    subtitle="Áp dụng chung cho toàn bộ sự kiện"
                    count={ticketTypes.length}
                    action={
                        <button
                            onClick={() => setOpenTicketModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/8 transition-all"
                        >
                            <FiEdit2 size={12} />
                            Quản lý vé
                        </button>
                    }
                />

                {hasTickets ? (
                    <div className="space-y-2">
                        {ticketTypes.map((t) => (
                            <TicketTypeRow key={t.id} ticket={t} />
                        ))}

                        <div className="flex items-center justify-between px-4 py-3 mt-1 rounded-xl bg-white/[0.025] border border-white/5">
                            <span className="text-xs text-slate-500">Tổng số vé phát hành</span>
                            <span className="text-sm font-black text-white">
                                {ticketTypes.reduce((a, t) => a + t.quantity, 0).toLocaleString("vi-VN")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <EmptyTickets onManage={() => setOpenTicketModal(true)} />
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all text-sm font-medium"
                >
                    ← Quay lại
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all"
                >
                    Tiếp theo →
                </button>
            </div>

            {eventId && (
                <CreateSessionModal
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    eventId={eventId}
                    onCreated={loadSessions}
                />
            )}

            {eventId && editingSession && (
                <EditSessionModal
                    open={true}
                    onClose={() => setEditingSession(null)}
                    eventId={eventId}
                    session={editingSession}
                    onUpdated={loadSessions}
                />
            )}

            {eventId && (
                <TicketTypeModal
                    open={openTicketModal}
                    onClose={() => setOpenTicketModal(false)}
                    eventId={eventId}
                />
            )}
        </div>
    );
}