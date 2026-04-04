import { useCallback, useEffect, useState } from "react";
import {
    FiAlertTriangle,
    FiCalendar, FiClock,
    FiEdit2,
    FiInfo,
    FiLayers,
    FiLock,
    FiPlus,
    FiTag,
    FiTrash2
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchDeleteSession, fetchSessions, fetchUpdateEventSettings } from "../../../store/eventSlice";
import { fetchGetAllTicketTypes } from "../../../store/ticketTypeSlice";
import type { EventSession, GetEventDetailResponse } from "../../../types/event/event";
import type { TicketTypeItem } from "../../../types/ticketType/ticketType";
import { notify } from "../../../utils/notify";
import CreateSessionModal from "../sessions/CreateSessionModal";
import EditSessionModal from "../sessions/EditSessionModal";
import DateTimeInput from "../shared/DateTimeInput";
import TicketTypeModal from "../ticket/TicketTypeModal";

import { isoToLocal, localToIso } from "../../../utils/dateTimeVN";
import {
    errorsToFieldMap,
    getInvalidSessions,
    validateEventTime,
    type EventTimeWindow,
    type InvalidSessionsResult,
    type SessionWindow,
} from "../../../utils/eventValidation";
import { formatDateTime } from "../../../utils/formatDateTime";
import ConfirmModal from "../shared/ConfirmModal";
import { UnsavedBanner } from "../shared/UnsavedBanner";

const formatPrice = (price: number) =>
    price === 0 ? "FREE" : price.toLocaleString("vi-VN") + "đ";

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
    session, onEdit, onDelete, hasConflict, isAllowUpdate
}: {
    session: EventSession & { id: string };
    onEdit: () => void;
    onDelete: () => void;
    hasConflict?: boolean;
    isAllowUpdate: boolean;
}) {
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const handleDelete = async () => {
        setDeleting(true);
        try { onDelete(); } finally { setDeleting(false); }
    };

    return (
        <div className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${hasConflict
            ? "bg-red-950/30 border-red-500/30 hover:border-red-500/50"
            : "bg-[#18122B] border-white/5 hover:border-primary/25 hover:bg-[#1e1638]"
            }`}>
            <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-colors ${hasConflict ? "bg-red-500/60" : "bg-primary/30 group-hover:bg-primary/60"
                }`} />
            <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm truncate">{session.title}</p>
                    {hasConflict && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                            <FiAlertTriangle size={9} /> Ngoài giờ sự kiện
                        </span>
                    )}
                </div>
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
            {isAllowUpdate && (
                <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all border border-white/5"
                    >
                        <FiEdit2 size={12} /> Sửa
                    </button>

                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={deleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 font-medium text-xs transition-all border border-red-500/10 disabled:opacity-50"
                    >
                        <FiTrash2 size={12} /> {deleting ? "..." : "Xoá"}
                    </button>
                </div>
            )}
            <ConfirmModal
                open={showConfirm}
                title="Xóa xuất diễn"
                description="Bạn có chắc muốn xóa suất diễn này? Hành động này có thể không hoàn tác."
                confirmText="Xóa"
                onCancel={() => setShowConfirm(false)}
                onConfirm={handleDelete}
            />
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
                <p className="text-[10px] text-[#fffd] font-bold mt-0.5">mỗi vé</p>
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

function ConflictBanner({
    result,
    onDismiss,
}: {
    result: InvalidSessionsResult;
    onDismiss: () => void;
}) {
    if (!result.hasConflicts) return null;
    return (
        <div className="rounded-xl border border-red-500/25 bg-red-950/30 p-4 space-y-2">
            <div className="flex items-start gap-2">
                <FiAlertTriangle className="text-red-400 mt-0.5 shrink-0" size={14} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-300">
                        {result.conflicts.length} suất diễn nằm ngoài khung giờ sự kiện
                    </p>
                    <p className="text-xs text-red-400/80 mt-0.5">
                        Bạn cần chỉnh sửa hoặc xoá các suất diễn này trước khi tiếp tục.
                    </p>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-red-400/50 hover:text-red-300 transition-colors text-xs shrink-0"
                >
                    ✕
                </button>
            </div>
            <ul className="space-y-1 pl-5">
                {result.conflicts.map((c) => (
                    <li key={c.id} className="text-xs text-red-400/70">
                        <span className="font-semibold text-red-300">{c.title}</span>
                        {" — "}
                        {c.reasons.join(" · ")}
                    </li>
                ))}
            </ul>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

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
    isAllowUpdate?: boolean;
}

export default function Step2Schedule({
    onNext, onBack, eventData, reloadEvent, isAllowUpdate = true,
}: Step2ScheduleProps) {
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

    const [sessionConflicts, setSessionConflicts] = useState<InvalidSessionsResult>({
        hasConflicts: false,
        conflicts: [],
    });
    const [conflictDismissed, setConflictDismissed] = useState(false);

    const sessions = (useSelector(
        (state: RootState) => state.EVENT.sessions
    ) ?? []) as (EventSession & { id: string })[];

    const ticketTypes = useSelector(
        (state: RootState) => state.TICKET_TYPE.ticketTypes
    ) ?? [];


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
    useEffect(() => {
        if (eventId && sessions?.length > 0) {
            dispatch(fetchGetAllTicketTypes({
                eventId,
                eventSessionId: sessions[0].id
            }));
        }
    }, [eventId, sessions]);

    const recomputeConflicts = useCallback(
        (form: TimeForm, currentSessions: typeof sessions) => {
            if (!form.eventStartAt || !form.eventEndAt || currentSessions.length === 0) {
                setSessionConflicts({ hasConflicts: false, conflicts: [] });
                return;
            }
            const result = getInvalidSessions(
                currentSessions.map((s) => ({
                    id: s.id,
                    title: s.title,
                    startTime: s.startTime,
                    endTime: s.endTime,
                })) satisfies SessionWindow[],
                {
                    eventStartAt: localToIso(form.eventStartAt),
                    eventEndAt: localToIso(form.eventEndAt),
                }
            );
            setSessionConflicts(result);
            if (result.hasConflicts) setConflictDismissed(false);
        },
        []
    );

    useEffect(() => {
        recomputeConflicts(timeForm, sessions);
    }, [timeForm.eventStartAt, timeForm.eventEndAt, sessions, recomputeConflicts]);

    const hasSessions = sessions.length > 0;

    const hasTickets = ticketTypes.length > 0;
    const conflictIds = new Set(sessionConflicts.conflicts.map((c) => c.id));

    const runTimeValidation = (): boolean => {
        const result = validateEventTime(timeForm as EventTimeWindow);
        setTimeErrors(errorsToFieldMap(result.errors));
        return result.valid;
    };

    const toUTC = (local: string) => new Date(local).toISOString();

    const isTimeFormChanged = () =>
        initialTimeForm === null ||
        JSON.stringify(initialTimeForm) !== JSON.stringify(timeForm);

    const handleNext = async () => {
        if (!runTimeValidation()) return;
        if (!hasSessions) { notify.error("Sự kiện phải có ít nhất 1 suất diễn"); return; }
        if (!hasTickets) { notify.error("Sự kiện phải có ít nhất 1 loại vé"); return; }

        if (sessionConflicts.hasConflicts) {
            notify.error(
                `${sessionConflicts.conflicts.length} suất diễn nằm ngoài khung giờ sự kiện. Vui lòng chỉnh sửa trước khi tiếp tục.`
            );
            setConflictDismissed(false);
            return;
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
                setInitialTimeForm({ ...timeForm });
                notify.success("Đã lưu thời gian sự kiện");
            } catch {
                notify.error("Không thể lưu thời gian sự kiện");
                return;
            }
        }

        onNext();
    };

    const [bannerSaving, setBannerSaving] = useState(false);

    const handleBannerSave = async () => {
        if (!runTimeValidation()) return;
        if (!eventId) return;
        setBannerSaving(true);
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
            setInitialTimeForm({ ...timeForm });
            await reloadEvent?.();
            notify.success("Đã lưu thời gian sự kiện");
        } catch {
            notify.error("Không thể lưu thời gian sự kiện");
        } finally {
            setBannerSaving(false);
        }
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
            ticketSaleStartAt: eventData.ticketSaleStartAt ? isoToLocal(eventData.ticketSaleStartAt) : "",
            ticketSaleEndAt: eventData.ticketSaleEndAt ? isoToLocal(eventData.ticketSaleEndAt) : "",
            eventStartAt: eventData.eventStartAt ? isoToLocal(eventData.eventStartAt) : "",
            eventEndAt: eventData.eventEndAt ? isoToLocal(eventData.eventEndAt) : "",
        };
        setTimeForm(form);
        setInitialTimeForm(form);
    }, [eventData]);

    const isDirty = isTimeFormChanged();

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {isDirty && isAllowUpdate && (
                <UnsavedBanner onSave={handleBannerSave} saving={bannerSaving} />
            )}
            <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Thời gian biểu & Loại vé</h2>
                <p className="text-sm text-slate-500 mt-1">Thiết lập các suất diễn và hạng vé cho sự kiện.</p>
            </div>

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiLock size={16} />}
                    title="Thời gian bán vé"
                    subtitle="Khoảng thời gian cho phép mua vé"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <DateTimeInput
                            disabled={!isAllowUpdate}
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
                            disabled={!isAllowUpdate}
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

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiInfo size={16} />}
                    title="Thời gian sự kiện"
                    subtitle="Khung giờ chính thức của sự kiện"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <DateTimeInput
                            disabled={!isAllowUpdate}
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
                            disabled={!isAllowUpdate}
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

            <div className="rounded-2xl bg-[#100d1f] border border-white/5 p-6">
                <SectionHeader
                    icon={<FiLayers size={16} />}
                    title="Suất diễn"
                    subtitle="Các khung giờ diễn ra sự kiện"
                    count={sessions.length}
                    action={
                        <button
                            disabled={!isAllowUpdate}
                            onClick={() => setOpenCreateModal(true)}
                            className={`
                                flex items-center gap-1.5 px-4 py-2 rounded-xl
                                font-semibold text-xs transition-colors
                                
                                bg-primary text-white hover:bg-primary/90
                                
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <FiPlus size={13} /> Tạo suất diễn
                        </button>
                    }
                />

                {!conflictDismissed && (
                    <div className="mb-4">
                        <ConflictBanner
                            result={sessionConflicts}
                            onDismiss={() => setConflictDismissed(true)}
                        />
                    </div>
                )}

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
                                hasConflict={conflictIds.has(s.id)}
                                onEdit={() => setEditingSession(s)}
                                onDelete={() => handleDelete(s.id)}
                                isAllowUpdate={isAllowUpdate}
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
                    {isTimeFormChanged() ? "Lưu & tiếp tục →" : "Tiếp theo →"}
                </button>
            </div>

            {eventId && (
                <CreateSessionModal
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    eventId={eventId}
                    eventStartAt={timeForm.eventStartAt}
                    eventEndAt={timeForm.eventEndAt}
                    isAllowUpdate={isAllowUpdate}
                    onCreated={async () => {
                        loadSessions();
                    }}
                />
            )}
            {eventId && editingSession && (
                <EditSessionModal
                    open={true}
                    onClose={() => setEditingSession(null)}
                    eventId={eventId}
                    session={editingSession}
                    isAllowUpdate={isAllowUpdate}
                    eventStartAt={timeForm.eventStartAt}
                    eventEndAt={timeForm.eventEndAt}
                    onUpdated={async () => {
                        loadSessions();
                    }}
                />
            )}
            {eventId && (
                <TicketTypeModal
                    sessions={sessions}
                    open={openTicketModal}
                    isAllowUpdate={isAllowUpdate}
                    onClose={async () => {
                        setOpenTicketModal(false);
                    }}
                    eventId={eventId}
                />
            )}
        </div>
    );
}