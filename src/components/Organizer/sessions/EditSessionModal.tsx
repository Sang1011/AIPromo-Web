import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FiX } from "react-icons/fi";
import type { AppDispatch } from "../../../store";
import { fetchUpdateSession } from "../../../store/eventSlice";
import type { EventSession } from "../../../types/event/event";
import { notify } from "../../../utils/notify";

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

const toDatetimeLocal = (iso: string) => (iso ? iso.slice(0, 16) : "");

interface EditSessionModalProps {
    open: boolean;
    onClose: () => void;
    eventId: string;
    session: EventSession & { id: string };
    eventStartAt?: string;
    eventEndAt?: string;
    onUpdated?: () => void;
}

export default function EditSessionModal({
    open, onClose, eventId, session,
    eventStartAt, eventEndAt,
    onUpdated,
}: EditSessionModalProps) {
    const dispatch = useDispatch<AppDispatch>();

    const initialForm = (): SessionFormState => ({
        title: session.title,
        description: session.description ?? "",
        startTime: toDatetimeLocal(session.startTime),
        endTime: toDatetimeLocal(session.endTime),
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
        const e: SessionFormErrors = {};
        if (!form.title.trim()) e.title = "Tiêu đề không được để trống";
        if (!form.startTime) e.startTime = "Vui lòng chọn thời gian bắt đầu";
        if (!form.endTime) e.endTime = "Vui lòng chọn thời gian kết thúc";
        else if (form.startTime && form.endTime <= form.startTime)
            e.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";

        // Validate nằm trong khoảng sự kiện
        if (form.startTime && eventStartAt && new Date(form.startTime) < new Date(eventStartAt))
            e.startTime = `Suất diễn phải bắt đầu từ ${new Date(eventStartAt).toLocaleString("vi-VN")} trở đi`;

        if (form.endTime && eventEndAt && new Date(form.endTime) > new Date(eventEndAt))
            e.endTime = `Suất diễn phải kết thúc trước ${new Date(eventEndAt).toLocaleString("vi-VN")}`;

        setErrors(e);
        return Object.keys(e).length === 0;
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
                    startTime: new Date(form.startTime).toISOString(),
                    endTime: new Date(form.endTime).toISOString(),
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

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {/* Title */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Tiêu đề suất diễn</label>
                        <input
                            value={form.title}
                            onChange={set("title")}
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
                            rows={3}
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-white text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                            placeholder="Mô tả ngắn về suất diễn..."
                        />
                    </div>

                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Bắt đầu</label>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={set("startTime")}
                                min={eventStartAt}
                                max={eventEndAt}
                                className={`w-full rounded-xl bg-black/30 border px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark] ${errors.startTime ? "border-red-500" : "border-white/10"}`}
                            />
                            {errors.startTime && <p className="text-xs text-red-400 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Kết thúc</label>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={set("endTime")}
                                min={eventStartAt}
                                max={eventEndAt}
                                className={`w-full rounded-xl bg-black/30 border px-3 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-primary/50 transition-all [color-scheme:dark] ${errors.endTime ? "border-red-500" : "border-white/10"}`}
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
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                    >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}