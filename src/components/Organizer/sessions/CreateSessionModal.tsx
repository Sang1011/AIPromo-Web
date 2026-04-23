import { useState } from "react";
import { FiClock } from "react-icons/fi";
import { fetchCreateEventSessions } from "../../../store/eventSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store";
import { notify } from "../../../utils/notify";
import { validateSession, errorsToFieldMap, checkSessionOverlap } from "../../../utils/eventValidation";
import DateTimeInput from "../shared/DateTimeInput";
import { localToIso } from "../../../utils/dateTimeVN";
import type { EventSession } from "../../../types/event/event";

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
    sessions?: (EventSession & { id: string })[];
    ticketSaleEndAt?: string;
    onCreated?: () => void;
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

export default function CreateSessionModal({
    open, onClose, eventId, eventStartAt, eventEndAt, sessions, onCreated, ticketSaleEndAt, isAllowUpdate = true,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errors, setErrors] = useState<SessionFormErrors>({});
    const [saving, setSaving] = useState(false);

    if (!open) return null;

    const validate = (): boolean => {
        const result = validateSession(
            { id: "", title, startTime, endTime },
            { eventStartAt, eventEndAt }
        );
        const map = errorsToFieldMap(result.errors) as SessionFormErrors;
        setErrors(map);
        return result.valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (ticketSaleEndAt && localToIso(startTime) < ticketSaleEndAt) {
            notify.error(`Suất diễn phải bắt đầu sau khi kết thúc bán vé (${formatDateTime(ticketSaleEndAt)})`);
            return;
        }
        if (sessions && sessions.length > 0) {
            const overlapping = checkSessionOverlap(
                { id: "", startTime: localToIso(startTime), endTime: localToIso(endTime) },
                sessions
            );
            if (overlapping) {
                notify.error(`Khung giờ bị trùng với suất diễn "${overlapping.title}"`);
                return;
            }
        }
        setSaving(true);
        try {
            await dispatch(
                fetchCreateEventSessions({
                    eventId,
                    data: {
                        sessions: [{
                            title: title.trim(),
                            description: description.trim(),
                            startTime: localToIso(startTime),
                            endTime: localToIso(endTime),
                        }],
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
            <div className="bg-[#1C1633] border border-white/10 p-8 rounded-2xl w-full max-w-[580px] shadow-2xl">

                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Tạo suất diễn</h3>
                    <p className="text-gray-400 text-sm mt-1">Điền thông tin chi tiết cho suất diễn mới của bạn.</p>
                </div>

                {ticketSaleEndAt && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-4">
                        <span className="text-xs font-bold text-amber-500/70 shrink-0">!</span>
                        <p className="text-sm font-semibold text-amber-400/80">
                            Bán vé kết thúc lúc {formatDateTime(ticketSaleEndAt)} — suất diễn phải bắt đầu sau mốc này
                        </p>
                    </div>
                )}

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
                                {sorted.map((s, i) => (
                                    <div key={s.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-black/20 border border-white/5">
                                        <span className="text-xs font-bold text-slate-600 w-4 shrink-0">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{s.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {formatDateTime(s.startTime)} → {formatDateTime(s.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2.5 text-center">
                                Suất diễn mới không được trùng với bất kỳ khung giờ nào trên
                            </p>
                        </div>
                    );
                })()}

                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Tên suất diễn
                        </label>
                        <input
                            type="text"
                            readOnly={!isAllowUpdate}
                            placeholder="VD: Buổi sáng - Khai mạc"
                            className={`w-full px-4 py-3 rounded-xl bg-white/5 border focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-white/20 text-white ${errors.title
                                    ? "border-red-500/60 focus:border-red-500"
                                    : "border-white/10 focus:border-primary"
                                }`}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors(p => ({ ...p, title: undefined }));
                            }}
                        />
                        {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 ml-1">
                            Mô tả
                        </label>
                        <textarea
                            placeholder="Nhập nội dung tóm tắt..."
                            rows={3}
                            readOnly={!isAllowUpdate}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-white/20 text-white"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <DateTimeInput
                                label="Bắt đầu"
                                value={startTime}
                                onChange={(v) => {
                                    setStartTime(v);
                                    if (errors.startTime) setErrors(p => ({ ...p, startTime: undefined }));
                                }}
                                disabled={!isAllowUpdate}
                            />
                            {errors.startTime && <p className="text-sm text-red-400 mt-1">{errors.startTime}</p>}
                        </div>
                        <div>
                            <DateTimeInput
                                label="Kết thúc"
                                value={endTime}
                                onChange={(v) => {
                                    setEndTime(v);
                                    if (errors.endTime) setErrors(p => ({ ...p, endTime: undefined }));
                                }}
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
                        onClick={handleSubmit}
                        disabled={saving || !isAllowUpdate}
                        className="px-8 py-2.5 rounded-xl font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-white"
                    >
                        {saving ? "Đang tạo..." : "Tạo ngay"}
                    </button>
                </div>
            </div>
        </div>
    );
}