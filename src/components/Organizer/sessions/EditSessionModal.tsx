import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { fetchUpdateSession } from "../../../store/eventSlice";
import type { EventSession } from "../../../types/event/event";
import { notify } from "../../../utils/notify";

// ── NEW: pure validation helper ───────────────────────────────────────────────
import { isoToLocal, localToIso } from "../../../utils/dateTimeVN";
import { errorsToFieldMap, validateSession } from "../../../utils/eventValidation";
import DateTimeInput from "../shared/DateTimeInput";
// ─────────────────────────────────────────────────────────────────────────────

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
        endTime: isoToLocal(session.startTime),
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

    // ── CHANGED: hand-rolled validate() replaced with the pure helper ─────────
    const validate = (): boolean => {
        const result = validateSession(
            { id: session.id, title: form.title, startTime: form.startTime, endTime: form.endTime },
            { eventStartAt, eventEndAt }
        );
        const map = errorsToFieldMap(result.errors) as SessionFormErrors;
        setErrors(map);
        return result.valid;
    };
    // ─────────────────────────────────────────────────────────────────────────

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
            setForm((p) => ({ ...p, [key]: e.target.value }));
            if (errors[key as keyof SessionFormErrors])
                setErrors((p) => ({ ...p, [key]: undefined }));
        };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-white/10 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-white font-semibold">Chỉnh sửa suất diễn</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <FiX size={18} />
                    </button>
                </div>

                {/* NEW: event window hint */}
                {(eventStartAt || eventEndAt) && (
                    <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/8 text-xs text-slate-400">
                        <span className="text-primary/60">⏱</span>
                        Phải nằm trong:
                        {eventStartAt && <span className="text-slate-300">{new Date(eventStartAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
                        {eventStartAt && eventEndAt && <span>–</span>}
                        {eventEndAt && <span className="text-slate-300">{new Date(eventEndAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
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