import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock, FiTag, FiAlertTriangle } from "react-icons/fi";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchDeleteSession, fetchSessions } from "../../../store/eventSlice";
import type { EventSession, EventTicketType } from "../../../types/event/event";
import CreateSessionModal from "../sessions/CreateSessionModal";
import EditSessionModal from "../sessions/EditSessionModal";
import TicketTypeModal from "../ticket/TicketTypeModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Empty session placeholder ────────────────────────────────────────────────

function EmptySessionPlaceholder({ onCreateSession }: { onCreateSession: () => void }) {
    return (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 space-y-4">

            {/* Skeleton title row */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 rounded-md bg-white/5" />
                    <div className="h-3 w-32 rounded-md bg-white/5" />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-7 w-14 rounded-lg bg-white/5" />
                    <div className="h-7 w-14 rounded-lg bg-white/5" />
                </div>
            </div>

            {/* Skeleton time row */}
            <div className="flex gap-6">
                <div className="h-3 w-36 rounded-md bg-white/5" />
                <div className="h-3 w-36 rounded-md bg-white/5" />
            </div>

            {/* Ticket placeholder — amber themed */}
            <div className="rounded-xl border border-amber-500/20 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs text-amber-400/50 px-4 py-2 border-b border-amber-500/10 bg-amber-500/5">
                    <span>Loại vé</span>
                    <span className="text-right pr-6">Giá</span>
                    <span className="text-right pr-6">Đã bán</span>
                    <span className="text-right">Còn lại</span>
                </div>

                {/* Skeleton rows */}
                {[52, 36].map((w, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-4 py-3 border-b border-white/5">
                        <div className="space-y-1.5">
                            <div className={`h-3 rounded-md bg-white/5`} style={{ width: w * 0.5 + "rem" }} />
                            <div className="h-2.5 w-14 rounded-md bg-white/5" />
                        </div>
                        <div className="h-3 w-12 rounded-md bg-white/5 mr-6" />
                        <div className="h-3 w-6 rounded-md bg-white/5 mr-6" />
                        <div className="h-3 w-6 rounded-md bg-white/5" />
                    </div>
                ))}

                {/* Warning */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/10 bg-amber-500/5">
                    <FiAlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300">Cần ít nhất 1 suất diễn với loại vé trước khi tiếp tục</p>
                </div>

                <button
                    onClick={onCreateSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-ml font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                    <FiPlus size={13} />
                    Tạo suất diễn để bắt đầu
                </button>
            </div>
        </div>
    );
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionCard({
    session,
    onEdit,
    onDelete,
    onManageTickets,
}: {
    session: EventSession & { id: string };
    onEdit: () => void;
    onDelete: () => void;
    onManageTickets: () => void;
}) {
    const [deleting, setDeleting] = useState(false);
    const tickets: EventTicketType[] = session.ticketTypes ?? [];
    const hasTickets = tickets.length > 0;

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc muốn xoá suất diễn "${session.title}"?`)) return;
        setDeleting(true);
        try { onDelete(); } finally { setDeleting(false); }
    };

    return (
        <div className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-2xl ${!hasTickets
            ? "border-primary bg-card-dark shadow-primary-500/5"
            : "border-white/5 bg-card-dark hover:border-primary/30 shadow-black/50"
            }`}>

            <div className="p-7 space-y-6">
                {/* ── Header: Title & Actions ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-2xl font-extrabold text-white tracking-tight">
                                {session.title}
                            </h4>
                            {!hasTickets && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-[10px] font-bold uppercase">
                                    <FiAlertTriangle size={12} />
                                    Chưa có vé
                                </span>
                            )}
                        </div>
                        {session.description && (
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 max-w-2xl">
                                {session.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all border border-white/5"
                        >
                            <FiEdit2 size={16} />
                            Sửa
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all border border-red-500/10 disabled:opacity-50"
                        >
                            <FiTrash2 size={16} />
                            {deleting ? "..." : "Xoá"}
                        </button>
                    </div>
                </div>

                {/* ── Time Info: Tách biệt bằng Box Gradient ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B0B12]/60 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                            <FiCalendar size={22} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Bắt đầu lúc</p>
                            <p className="text-lg text-slate-200 font-bold">{formatDateTime(session.startTime)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B0B12]/60 border border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                            <FiClock size={22} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Kết thúc dự kiến</p>
                            <p className="text-lg text-slate-200 font-bold">{formatDateTime(session.endTime)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Ticket Table: Hiện đại & Font to ── */}
                <div className={`rounded-2xl border overflow-hidden ${!hasTickets ? "border-primary-500/20" : "border-white/5"}`}>
                    <div className="grid grid-cols-[1fr_120px_100px_100px] text-[10px] font-black uppercase tracking-[0.1em] px-6 py-3 bg-white/[0.03] text-slate-500">
                        <span>Hạng vé</span>
                        <span className="text-right">Giá tiền</span>
                        <span className="text-right">Đã bán</span>
                        <span className="text-right">Số lượng</span>
                    </div>

                    {hasTickets ? (
                        <div className="divide-y divide-white/5">
                            {tickets.map((t) => (
                                <div key={t.id} className="grid grid-cols-[1fr_120px_100px_100px] items-center px-6 py-5 hover:bg-white/[0.02] transition-colors">
                                    <div>
                                        <p className="text-lg font-bold text-white">{t.name}</p>
                                        <p className="text-xs text-slate-500 uppercase font-medium">{t.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-primary">{formatPrice(t.price)}</span>
                                    </div>
                                    <div className="text-right text-slate-400 font-bold">{t.soldQuantity}</div>
                                    <div className="text-right text-slate-400 font-bold">{t.availableQuantity}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center bg-primary-500/[0.02]">
                            <FiAlertTriangle size={40} className="text-primary-500/30 mb-4" />
                            <p className="text-primary-200/80 font-bold">Vui lòng thiết lập hạng vé</p>
                            <p className="text-primary-500/40 text-xs mt-1">Thông tin vé là bắt buộc để mở bán sự kiện</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer Button: Full Width & Call to Action ── */}
            <button
                onClick={onManageTickets}
                className={`w-full flex items-center justify-center gap-3 px-6 py-5 text-sm font-black uppercase tracking-widest transition-all ${!hasTickets
                    ? "bg-primary text-white hover:bg-opacity-80 hover:cursor"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-white border-t border-white/5"
                    }`}
            >
                <FiTag size={18} />
                {hasTickets ? "Cấu hình vé & Sơ đồ" : "Thêm vé ngay"}
            </button>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

    const [loading, setLoading] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [editingSession, setEditingSession] = useState<(EventSession & { id: string }) | null>(null);
    const [ticketSession, setTicketSession] = useState<(EventSession & { id: string }) | null>(null);

    const loadSessions = () => {
        if (!eventId) return;
        setLoading(true);
        dispatch(fetchSessions(eventId)).finally(() => setLoading(false));
    };

    useEffect(() => { loadSessions(); }, [eventId]);

    const handleDelete = (sessionId: string) => {
        if (!eventId) return;
        dispatch(fetchDeleteSession({ eventId, sessionId }));
    };

    const hasIncompleteSession = sessions.some(
        (s) => !s.ticketTypes || s.ticketTypes.length === 0
    );
    const canProceed = sessions.length > 0 && !hasIncompleteSession;

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Thời gian biểu</h2>
                    <p className="text-sm text-slate-400">Quản lý các suất diễn và loại vé tương ứng.</p>
                </div>
                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm"
                >
                    <FiPlus size={16} />
                    Tạo suất diễn
                </button>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="py-16 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <EmptySessionPlaceholder onCreateSession={() => setOpenCreateModal(true)} />
            ) : (
                <div className="space-y-4">
                    {sessions.map((s) => (
                        <SessionCard
                            key={s.id}
                            session={s}
                            onEdit={() => setEditingSession(s)}
                            onDelete={() => handleDelete(s.id)}
                            onManageTickets={() => setTicketSession(s)}
                        />
                    ))}
                </div>
            )}

            {/* ── Validation banner ── */}
            {sessions.length > 0 && hasIncompleteSession && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <FiAlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-300">
                        Một số suất diễn chưa có loại vé. Vui lòng hoàn tất trước khi tiếp tục.
                    </p>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
                >
                    Quay lại
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-3 rounded-xl border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 font-semibold"
                >
                    Next (dev)
                </button>
                <button
                    onClick={canProceed ? onNext : undefined}
                    disabled={!canProceed}
                    title={!canProceed ? "Hoàn tất tất cả suất diễn trước khi tiếp tục" : undefined}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    Tiếp theo →
                </button>
            </div>

            {/* ── Modals ── */}
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

            {eventId && ticketSession && (
                <TicketTypeModal
                    open={true}
                    onClose={() => setTicketSession(null)}
                    eventId={eventId}
                    session={ticketSession}
                    onUpdated={loadSessions}
                />
            )}
        </div>
    );
}