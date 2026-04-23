import { useEffect, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchUpdateSession } from "../../../store/eventSlice";
import type { EventSession } from "../../../types/event/event";
import { notify } from "../../../utils/notify";
import { isoToLocal, localToIso } from "../../../utils/dateTimeVN";
import { checkSessionOverlap, errorsToFieldMap, validateSession } from "../../../utils/eventValidation";
import DateTimeInput from "../shared/DateTimeInput";

interface SessionFormState {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
}

interface SessionFormErrors {
    title?: string;
    startTime?: string;
    endTime?: string;
}

interface EditSessionModalProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    session: EventSession & { id: string };
    eventStartAt?: string;
    eventEndAt?: string;
    ticketSaleEndAt?: string;
    sessions?: (EventSession & { id: string })[];
    onUpdated?: () => void;
    isAllowUpdate?: boolean;
}

function formatDateTime(dateStr: string | Date | null): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${days[d.getDay()]}, ${dd}/${mo}/${yyyy}`;
}

export default function EditSessionModal({
    open, onClose, eventId, session,
    eventStartAt, eventEndAt, sessions, ticketSaleEndAt,
    onUpdated, isAllowUpdate = true,
}: EditSessionModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    const initialForm = (): SessionFormState => ({
        title: session.title,
        description: session.description ?? "",
        startTime: isoToLocal(session.startTime),
        endTime: isoToLocal(session.endTime),
    });

    const [form, setForm] = useState<SessionFormState>(initialForm);
    const [errors, setErrors] = useState<SessionFormErrors>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(initialForm());
        setErrors({});
    }, [session]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const validate = (): boolean => {
        const result = validateSession(
            { id: session.id, title: form.title, startTime: form.startTime, endTime: form.endTime },
            { eventStartAt, eventEndAt }
        );
        const map = errorsToFieldMap(result.errors) as SessionFormErrors;
        setErrors(map);
        return result.valid;
    };

    const hasChanged = (): boolean => {
        const original = initialForm();
        return (
            form.title.trim() !== original.title.trim() ||
            form.description.trim() !== original.description.trim() ||
            form.startTime !== original.startTime ||
            form.endTime !== original.endTime
        );
    };

    const handleSave = async () => {
        if (!validate()) return;
        if (ticketSaleEndAt && localToIso(form.startTime) < ticketSaleEndAt) {
            notify.error(`Suất diễn phải bắt đầu sau khi kết thúc bán vé (${formatDateTime(ticketSaleEndAt)})`);
            return;
        }
        if (!hasChanged()) {
            notify.warning("Không có thay đổi nào để lưu");
            return;
        }
        if (sessions && sessions.length > 0) {
            const overlapping = checkSessionOverlap(
                { id: session.id, startTime: localToIso(form.startTime), endTime: localToIso(form.endTime) },
                sessions
            );
            if (overlapping) {
                notify.error(`Khung giờ bị trùng với suất diễn "${overlapping.title}"`);
                return;
            }
        }
        setSaving(true);
        try {
            await dispatch(fetchUpdateSession({
                eventId,
                sessionId: session.id,
                data: {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    startTime: localToIso(form.startTime),
                    endTime: localToIso(form.endTime),
                },
            })).unwrap();
            notify.success("Đã cập nhật suất diễn");
            onUpdated?.();
            onClose();
        } catch {
            notify.error("Không thể cập nhật suất diễn");
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof SessionFormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm(p => ({ ...p, [key]: e.target.value }));
            if (errors[key as keyof SessionFormErrors])
                setErrors(p => ({ ...p, [key]: undefined }));
        };
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#1C1633] border border-white/10 p-8 rounded-2xl w-full max-w-[580px] shadow-2xl">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Chỉnh sửa suất diễn</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Chỉnh sửa thông tin chi tiết cho suất diễn.</p>
                </div>

                {/* ticketSaleEndAt warning */}
                {ticketSaleEndAt && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
                        <span className="text-xs font-bold text-amber-500/70 shrink-0">!</span>
                        <p className="text-sm font-semibold text-amber-400/80">
                            Bán vé kết thúc lúc {formatDateTime(ticketSaleEndAt)} — suất diễn phải bắt đầu sau mốc này
                        </p>
                    </div>
                )}

                {/* Sessions list */}
                {sessions && sessions.length > 0 && (() => {
                    const sorted = [...sessions].sort((a, b) =>
                        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    );
                    return (
                        <div className="mb-6 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                            <div className="flex items-center gap-2 mb-3">
                                <FiClock size={13} className="text-slate-400 shrink-0" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Khung giờ đã có ({sorted.length} suất diễn)
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {sorted.map((s, i) => {
                                    const isSelf = s.id === session.id;
                                    return (
                                        <div key={s.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${isSelf
                                            ? "bg-primary/10 border-primary/30"
                                            : "bg-black/20 border-white/5"
                                            }`}>
                                            <span className="text-xs font-bold text-slate-600 w-4 shrink-0">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                                                    {isSelf && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                                                            Đang sửa
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {formatDateTime(s.startTime)} → {formatDateTime(s.endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-slate-500 mt-2.5 text-center">
                                Suất diễn không được trùng với bất kỳ khung giờ nào trên
                            </p>
                        </div>
                    );
                })()}

                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Tiêu đề suất diễn
                        </label>
                        <input
                            value={form.title}
                            onChange={set("title")}
                            readOnly={!isAllowUpdate}
                            placeholder="VD: Buổi sáng - Ngày 1"
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20 text-white ${errors.title ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-primary"
                                }`}
                        />
                        {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Mô tả
                        </label>
                        <textarea
                            value={form.description}
                            onChange={set("description")}
                            readOnly={!isAllowUpdate}
                            rows={3}
                            placeholder="Nhập nội dung tóm tắt..."
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-white/20 text-white"
                        />
                    </div>

                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <DateTimeInput
                                label="Bắt đầu"
                                value={form.startTime}
                                onChange={(v) => set("startTime")({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)}
                                disabled={!isAllowUpdate}
                            />
                            {errors.startTime && <p className="text-sm text-red-400 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <DateTimeInput
                                label="Kết thúc"
                                value={form.endTime}
                                onChange={(v) => set("endTime")({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)}
                                disabled={!isAllowUpdate}
                            />
                            {errors.endTime && <p className="text-sm text-red-400 mt-1">{errors.endTime}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isAllowUpdate}
                        className="px-8 py-2.5 rounded-xl font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-white"
                    >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}