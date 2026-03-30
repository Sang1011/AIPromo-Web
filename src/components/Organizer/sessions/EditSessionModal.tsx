import { useEffect, useState } from "react";
import { FiClock, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchUpdateSession } from "../../../store/eventSlice";
import type { EventSession } from "../../../types/event/event";
import { notify } from "../../../utils/notify";
import { isoToLocal, localToIso } from "../../../utils/dateTimeVN";
import { errorsToFieldMap, validateSession } from "../../../utils/eventValidation";
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
    eventStartAt, eventEndAt,
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
        if (!hasChanged()) {
            notify.warning("Không có thay đổi nào để lưu");
            return;
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

    const hasEventWindow = eventStartAt || eventEndAt;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-[580px] rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-white font-semibold">Chỉnh sửa suất diễn</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* Event window hint — redesigned */}
                {hasEventWindow && (
                    <div className="mx-6 mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FiClock size={13} className="text-primary shrink-0" />
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                Khung giờ cho phép
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {eventStartAt && (
                                <div className="rounded-lg bg-white/5 px-3 py-2">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Từ</p>
                                    <p className="text-sm text-white font-medium">{formatDateTime(eventStartAt)}</p>
                                </div>
                            )}
                            {eventEndAt && (
                                <div className="rounded-lg bg-white/5 px-3 py-2">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Đến</p>
                                    <p className="text-sm text-white font-medium">{formatDateTime(eventEndAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Tiêu đề suất diễn</label>
                        <input
                            value={form.title}
                            onChange={set("title")}
                            readOnly={!isAllowUpdate}
                            className={`w-full rounded-xl bg-black/30 border px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all ${errors.title ? "border-red-500" : "border-white/10"}`}
                            placeholder="VD: Buổi sáng - Ngày 1"
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={set("description")}
                            readOnly={!isAllowUpdate}
                            rows={3}
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-white text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                            placeholder="Mô tả ngắn về suất diễn..."
                        />
                    </div>

                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <DateTimeInput
                                label="Bắt đầu"
                                value={form.startTime}
                                onChange={(v) => set("startTime")({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)}
                                disabled={!isAllowUpdate}
                            />
                            {errors.startTime && <p className="text-xs text-red-400 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <DateTimeInput
                                label="Kết thúc"
                                value={form.endTime}
                                onChange={(v) => set("endTime")({ target: { value: v } } as React.ChangeEvent<HTMLInputElement>)}
                                disabled={!isAllowUpdate}
                            />
                            {errors.endTime && <p className="text-xs text-red-400 mt-1">{errors.endTime}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isAllowUpdate}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                    >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}