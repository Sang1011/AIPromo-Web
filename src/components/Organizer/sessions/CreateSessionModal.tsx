import { useState } from "react";
import { fetchCreateEventSessions } from "../../../store/eventSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { notify } from "../../../utils/notify";

// ── NEW: pure validation helper ───────────────────────────────────────────────
import { validateSession, errorsToFieldMap } from "../../../utils/eventValidation";
import DateTimeInput from "../shared/DateTimeInput";
import { localToIso } from "../../../utils/dateTimeVN";
// ─────────────────────────────────────────────────────────────────────────────

interface SessionFormErrors {
    title?: string;
    startTime?: string;
    endTime?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    eventId: string;
    eventStartAt?: string;
    eventEndAt?: string;
    onCreated?: () => void;
    isAllowUpdate?: boolean;
}

export default function CreateSessionModal({
    open, onClose, eventId, eventStartAt, eventEndAt, onCreated, isAllowUpdate = true,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errors, setErrors] = useState<SessionFormErrors>({});
    const [saving, setSaving] = useState(false);

    if (!open) return null;

    // ── CHANGED: hand-rolled validate() replaced with the pure helper ─────────
    const validate = (): boolean => {
        const result = validateSession(
            { id: "", title, startTime, endTime },
            { eventStartAt, eventEndAt }
        );
        const map = errorsToFieldMap(result.errors) as SessionFormErrors;
        setErrors(map);
        return result.valid;
    };
    // ─────────────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            await dispatch(
                fetchCreateEventSessions({
                    eventId,
                    data: {
                        sessions: [
                            {
                                title: title.trim(),
                                description: description.trim(),
                                startTime: localToIso(startTime),
                                endTime: localToIso(endTime),
                            },
                        ],
                    },
                })
            ).unwrap();

            notify.success("Đã tạo suất diễn");
            onCreated?.();
            onClose();
        } catch {
            notify.error("Không thể tạo suất diễn");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1C1633] border border-white/10 p-8 rounded-2xl w-full max-w-[540px] shadow-2xl transform transition-all">

                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Tạo suất diễn</h3>
                    <p className="text-gray-400 text-sm mt-1">Điền thông tin chi tiết cho suất diễn mới của bạn.</p>
                </div>

                {/* NEW: show event window hint when it's set */}
                {(eventStartAt || eventEndAt) && (
                    <div className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-slate-400">
                        Suất diễn phải nằm trong khung giờ sự kiện
                        {eventStartAt && <> từ <span className="text-slate-300">{new Date(eventStartAt + ":00Z").toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></>}
                        {eventEndAt && <> đến <span className="text-slate-300">{new Date(eventEndAt + ":00Z").toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></>}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Tên suất diễn
                        </label>
                        <input
                            type="text"
                            readOnly={!isAllowUpdate}
                            placeholder="VD: Buổi sáng - Khai mạc"
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20 ${errors.title
                                ? "border-red-500/60 focus:border-red-500"
                                : "border-white/10 focus:border-primary"
                                }`}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                            }}
                        />
                        {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Mô tả
                        </label>
                        <textarea
                            placeholder="Nhập nội dung tóm tắt..."
                            rows={3}
                            readOnly={!isAllowUpdate}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-white/20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Start / End time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <DateTimeInput
                                label="Bắt đầu"
                                value={startTime}
                                onChange={(v) => {
                                    setStartTime(v);
                                    if (errors.startTime) setErrors((p) => ({ ...p, startTime: undefined }));
                                }}
                                disabled={!isAllowUpdate}
                            />
                            {errors.startTime && <p className="text-xs text-red-400 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <DateTimeInput
                                label="Kết thúc"
                                value={endTime}
                                onChange={(v) => {
                                    setEndTime(v);
                                    if (errors.endTime) setErrors((p) => ({ ...p, endTime: undefined }));
                                }}
                                disabled={!isAllowUpdate}
                            />
                            {errors.endTime && <p className="text-xs text-red-400 mt-1">{errors.endTime}</p>}
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
                        onClick={handleSubmit}
                        disabled={saving || !isAllowUpdate}
                        className="px-8 py-2.5 rounded-xl font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? "Đang tạo..." : "Tạo ngay"}
                    </button>
                </div>
            </div>
        </div>
    );
}