import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock,
    FiTag, FiLayers, FiAlertTriangle, FiLock, FiInfo
} from "react-icons/fi";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchDeleteSession, fetchSessions, fetchUpdateEventSettings } from "../../../store/eventSlice";
import type { EventSession, GetEventDetailResponse } from "../../../types/event/event";
import CreateSessionModal from "../sessions/CreateSessionModal";
import EditSessionModal from "../sessions/EditSessionModal";
import TicketTypeModal from "../ticket/TicketTypeModal";
import { fetchGetAllTicketTypes } from "../../../store/ticketTypeSlice";
import type { TicketTypeItem } from "../../../types/ticketType/ticketType";
import { notify } from "../../../utils/notify";
import DateTimeInput from "../shared/DateTimeInput";
import "../shared/datetime.css";

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

const toLocalDateTime = (iso: string) => {
    const date = new Date(iso);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function SectionHeader({
    icon, title, subtitle, count, action,
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
    session, onEdit, onDelete,
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
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/30 group-hover:bg-primary/60 transition-colors" />
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
            <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all border border-white/5"
                >
                    <FiEdit2 size={12} /> Sửa
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 font-medium text-xs transition-all border border-red-500/10 disabled:opacity-50"
                >
                    <FiTrash2 size={12} /> {deleting ? "..." : "Xoá"}
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
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-white truncate">{ticket.name}</span>
                <p className="text-[11px] text-slate-400 mt-1">
                    Số lượng: <span className="text-white font-medium">{ticket.quantity}</span>
                </p>
            </div>
            <div className="text-right shrink-0">
                <span className="text-sm font-black text-primary">{formatPrice(ticket.price)}</span>
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
                className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
            >
                <FiPlus size={14} /> Thiết lập loại vé ngay
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

type TimeForm = {
    ticketSaleStartAt: string;
    ticketSaleEndAt: string;
    eventStartAt: string;
    eventEndAt: string;
};

type TimeFormErrors = Partial<Record<keyof TimeForm, string>>;

interface Step2ScheduleProps {
    onNext: () => void;
    onBack: () => void;
    eventData: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
}

export default function Step2Schedule({ onNext, onBack, eventData, reloadEvent }: Step2ScheduleProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { eventId } = useParams<{ eventId: string }>();
    const [timeForm, setTimeForm] = useState<TimeForm>({
        ticketSaleStartAt: "",
        ticketSaleEndAt: "",
        eventStartAt: "",
        eventEndAt: "",
    });
    const [initialTimeForm, setInitialTimeForm] = useState<TimeForm | null>(null);
    const [timeErrors, setTimeErrors] = useState<TimeFormErrors>({});
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
    useEffect(() => { if (eventId) dispatch(fetchGetAllTicketTypes({ eventId })); }, [eventId]);

    const hasSessions = sessions.length > 0;
    const hasTickets = ticketTypes.length > 0;

    const validateTimeForm = (): boolean => {
        const e: TimeFormErrors = {};
        if (!timeForm.ticketSaleStartAt) e.ticketSaleStartAt = "Vui lòng chọn thời gian bắt đầu bán vé";
        if (!timeForm.ticketSaleEndAt) e.ticketSaleEndAt = "Vui lòng chọn thời gian kết thúc bán vé";
        if (!timeForm.eventStartAt) e.eventStartAt = "Vui lòng chọn thời gian bắt đầu sự kiện";
        if (!timeForm.eventEndAt) e.eventEndAt = "Vui lòng chọn thời gian kết thúc sự kiện";

        if (timeForm.ticketSaleStartAt && timeForm.ticketSaleEndAt &&
            new Date(timeForm.ticketSaleStartAt) >= new Date(timeForm.ticketSaleEndAt))
            e.ticketSaleEndAt = "Thời gian kết thúc bán vé phải sau thời gian bắt đầu";

        if (timeForm.ticketSaleEndAt && timeForm.eventStartAt &&
            new Date(timeForm.ticketSaleEndAt) > new Date(timeForm.eventStartAt))
            e.eventStartAt = "Sự kiện phải bắt đầu sau khi kết thúc bán vé";

        if (timeForm.eventStartAt && timeForm.eventEndAt &&
            new Date(timeForm.eventStartAt) >= new Date(timeForm.eventEndAt))
            e.eventEndAt = "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu";

        setTimeErrors(e);
        return Object.keys(e).length === 0;
    };

    const toUTC = (local: string) => new Date(local).toISOString();

    const isTimeFormChanged = () =>
        initialTimeForm === null ||
        JSON.stringify(initialTimeForm) !== JSON.stringify(timeForm);

    const handleNext = async () => {
        if (!validateTimeForm()) return;
        if (!hasSessions) { notify.error("Sự kiện phải có ít nhất 1 suất diễn"); return; }
        if (!hasTickets) { notify.error("Sự kiện phải có ít nhất 1 loại vé"); return; }

        if (timeForm.eventStartAt && timeForm.eventEndAt) {
            const eventStart = new Date(timeForm.eventStartAt);
            const eventEnd = new Date(timeForm.eventEndAt);

            const invalidSession = sessions.find(s => {
                const sStart = new Date(s.startTime);
                const sEnd = new Date(s.endTime);
                return sStart < eventStart || sEnd > eventEnd;
            });

            if (invalidSession) {
                notify.error(
                    `Suất diễn "${invalidSession.title}" nằm ngoài khoảng thời gian sự kiện`
                );
                return;
            }
        }

        if (isTimeFormChanged()) {
            if (!eventId) return;
            try {
                await dispatch(fetchUpdateEventSettings({
                    eventId,
                    data: {
                        ticketSaleStartAt: toUTC(timeForm.ticketSaleStartAt),
                        ticketSaleEndAt: toUTC(timeForm.ticketSaleEndAt),
                        eventStartAt: toUTC(timeForm.eventStartAt),
                        eventEndAt: toUTC(timeForm.eventEndAt),
                        isEmailReminderEnabled: eventData?.isEmailReminderEnabled ?? false,
                        urlPath: eventData?.urlPath ?? "",
                    },
                })).unwrap();
                await reloadEvent?.();
                notify.success("Đã lưu thời gian sự kiện");
            } catch {
                notify.error("Không thể lưu thời gian sự kiện");
                return;
            }
        }

        onNext();
    };

    const handleDelete = async (sessionId: string) => {
        if (!eventId) return;
        try {
            await dispatch(fetchDeleteSession({ eventId, sessionId })).unwrap();
            notify.success("Đã xoá suất diễn");
        } catch {
            notify.error("Không thể xoá suất diễn");
        }
    };

    useEffect(() => {
        if (!eventData || initialTimeForm) return;
        const form: TimeForm = {
            ticketSaleStartAt: eventData.ticketSaleStartAt ? toLocalDateTime(eventData.ticketSaleStartAt) : "",
            ticketSaleEndAt: eventData.ticketSaleEndAt ? toLocalDateTime(eventData.ticketSaleEndAt) : "",
            eventStartAt: eventData.eventStartAt ? toLocalDateTime(eventData.eventStartAt) : "",
            eventEndAt: eventData.eventEndAt ? toLocalDateTime(eventData.eventEndAt) : "",
        };
        setTimeForm(form);
        setInitialTimeForm(form);
    }, [eventData]);

    return (
        <div className="space-y-8 max-w-3xl mx-auto">

            <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Thời gian biểu & Loại vé</h2>
                <p className="text-sm text-slate-500 mt-1">Thiết lập các suất diễn và hạng vé cho sự kiện.</p>
            </div>

            {/* ===== Thời gian bán vé ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiLock size={16} />}
                    title="Thời gian bán vé"
                    subtitle="Khoảng thời gian cho phép mua vé"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Bắt đầu bán vé"
                            value={timeForm.ticketSaleStartAt}
                            onChange={(v) => setTimeForm(p => ({ ...p, ticketSaleStartAt: v }))}
                        />
                        {timeErrors.ticketSaleStartAt && (
                            <p className="text-red-400 text-xs mt-1">{timeErrors.ticketSaleStartAt}</p>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Kết thúc bán vé"
                            value={timeForm.ticketSaleEndAt}
                            onChange={(v) => setTimeForm(p => ({ ...p, ticketSaleEndAt: v }))}
                        />
                        {timeErrors.ticketSaleEndAt && (
                            <p className="text-red-400 text-xs mt-1">{timeErrors.ticketSaleEndAt}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== Thời gian sự kiện ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiInfo size={16} />}
                    title="Thời gian sự kiện"
                    subtitle="Khung giờ chính thức của sự kiện"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Bắt đầu sự kiện"
                            value={timeForm.eventStartAt}
                            onChange={(v) => setTimeForm(p => ({ ...p, eventStartAt: v }))}
                        />
                        {timeErrors.eventStartAt && (
                            <p className="text-red-400 text-xs mt-1">{timeErrors.eventStartAt}</p>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Kết thúc sự kiện"
                            value={timeForm.eventEndAt}
                            onChange={(v) => setTimeForm(p => ({ ...p, eventEndAt: v }))}
                        />
                        {timeErrors.eventEndAt && (
                            <p className="text-red-400 text-xs mt-1">{timeErrors.eventEndAt}</p>
                        )}
                    </div>
                </div>
            </section>

            <Divider />

            {/* ===== Suất diễn ===== */}
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
                            <FiPlus size={13} /> Tạo suất diễn
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

            {/* ===== Loại vé ===== */}
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
                            <FiEdit2 size={12} /> Quản lý vé
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

            {/* ===== Footer ===== */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-xl border border-white/8 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all text-sm font-medium"
                >
                    ← Quay lại
                </button>
                <button
                    onClick={handleNext}
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
                    eventStartAt={timeForm.eventStartAt}
                    eventEndAt={timeForm.eventEndAt}
                    onCreated={async () => {
                        loadSessions();
                        await reloadEvent?.();
                    }}
                />
            )}
            {eventId && editingSession && (
                <EditSessionModal
                    open={true}
                    onClose={() => setEditingSession(null)}
                    eventId={eventId}
                    session={editingSession}
                    eventStartAt={timeForm.eventStartAt}
                    eventEndAt={timeForm.eventEndAt}
                    onUpdated={async () => {
                        loadSessions();
                        await reloadEvent?.();
                    }}
                />
            )}
            {eventId && (
                <TicketTypeModal
                    open={openTicketModal}
                    onClose={async () => {
                        setOpenTicketModal(false);
                        await reloadEvent?.();
                    }}
                    eventId={eventId}
                />
            )}
        </div>
    );
}