import { useEffect, useState } from "react";
import { FiEye, FiLink, FiMap, FiPlus, FiEdit2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../../store";
import { fetchUpdateEventSettings } from "../../../store/eventSlice";
import { fetchGetSeatMap } from "../../../store/seatMapSlice";
import type { GetEventDetailResponse } from "../../../types/event/event";
import { notify } from "../../../utils/notify";

interface Step3SettingsProps {
    onNext?: () => void;
    onBack?: () => void;
    eventData: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
}

type EventSettingsForm = {
    isEmailReminderEnabled: boolean;
    urlPath: string;
};

export default function Step3Settings({
    onNext, onBack, eventData, reloadEvent
}: Step3SettingsProps) {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [settingsForm, setSettingsForm] = useState<EventSettingsForm>({
        isEmailReminderEnabled: false,
        urlPath: "",
    });
    const [initialForm, setInitialForm] = useState<EventSettingsForm | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof EventSettingsForm, string>>>({});

    // ── Seatmap state ─────────────────────────────────────────────────────────
    const [seatMapSpec, setSeatMapSpec] = useState<string | null>(null);
    const [seatMapLoading, setSeatMapLoading] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        setSeatMapLoading(true);
        dispatch(fetchGetSeatMap(eventId))
            .unwrap()
            .then((spec) => setSeatMapSpec(spec ?? null))
            .catch(() => setSeatMapSpec(null))
            .finally(() => setSeatMapLoading(false));
    }, [eventId]);

    const hasSeatMap = !!seatMapSpec;

    // ── Form helpers ──────────────────────────────────────────────────────────

    const updateForm = <K extends keyof EventSettingsForm>(key: K, value: EventSettingsForm[K]) => {
        setSettingsForm(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof EventSettingsForm, string>> = {};
        if (!settingsForm.urlPath) {
            newErrors.urlPath = "Vui lòng nhập đường dẫn tùy chỉnh";
        } else {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(settingsForm.urlPath))
                newErrors.urlPath = "URL chỉ được chứa chữ thường, số và dấu gạch ngang";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormChanged = () => {
        if (!initialForm) return true;
        return JSON.stringify(initialForm) !== JSON.stringify(settingsForm);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!isFormChanged()) { onNext?.(); return; }
        if (!eventId) return;

        try {
            await dispatch(fetchUpdateEventSettings({
                eventId,
                data: {
                    ...settingsForm,
                    ticketSaleStartAt: eventData?.ticketSaleStartAt ?? "",
                    ticketSaleEndAt: eventData?.ticketSaleEndAt ?? "",
                    eventStartAt: eventData?.eventStartAt ?? "",
                    eventEndAt: eventData?.eventEndAt ?? "",
                }
            })).unwrap();
            await reloadEvent?.();
            notify.success("Đã lưu cài đặt sự kiện");
            onNext?.();
        } catch {
            notify.error("Không thể lưu cài đặt sự kiện");
        }
    };

    const generateUrl = () => {
        if (!eventData?.title) { notify.error("Không tìm thấy tên sự kiện để tạo URL"); return; }
        const slug = eventData.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        updateForm("urlPath", slug);
    };

    useEffect(() => {
        if (!eventData || initialForm) return;
        const newForm = {
            isEmailReminderEnabled: eventData.isEmailReminderEnabled ?? false,
            urlPath: eventData.urlPath ?? "",
        };
        setSettingsForm(newForm);
        setInitialForm(newForm);
    }, [eventData]);

    return (
        <div className="space-y-8">

            {/* ===== Cài đặt tùy chỉnh ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiEye />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Cài đặt tùy chỉnh</h2>
                </div>
                <Toggle
                    title="Tự động gửi email nhắc nhở"
                    desc="Gửi thông báo cho người tham dự 24h trước khi sự kiện diễn ra."
                    checked={settingsForm.isEmailReminderEnabled}
                    onChange={(v) => updateForm("isEmailReminderEnabled", v)}
                />
            </section>

            {/* ===== Sơ đồ chỗ ngồi ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiMap />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Sơ đồ chỗ ngồi</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Thiết lập sơ đồ ghế cho sự kiện của bạn</p>
                    </div>
                </div>

                {seatMapLoading ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Đang tải...
                    </div>
                ) : hasSeatMap ? (
                    // ── Đã có seatmap ────────────────────────────────────────
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                <FiMap size={15} className="text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Sơ đồ đã được thiết lập</p>
                                <p className="text-xs text-slate-500 mt-0.5">Nhấn để chỉnh sửa cấu hình ghế ngồi</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(`/organizer/my-events/${eventId}/seat-map/edit`, {
                                state: { from: "edit" }
                            })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-sm text-white font-medium transition-all"
                        >
                            <FiEdit2 size={14} />
                            Chỉnh sửa
                        </button>
                    </div>
                ) : (
                    // ── Chưa có seatmap ──────────────────────────────────────
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-6 flex flex-col items-center gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <FiMap size={22} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-300">Chưa có sơ đồ chỗ ngồi</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Bạn có muốn tạo sơ đồ ghế ngồi cho sự kiện này không?
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(`/organizer/my-events/${eventId}/seat-map/edit`, {
                                state: { from: "edit" }
                            })}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all"
                        >
                            <FiPlus size={15} />
                            Thêm sơ đồ chỗ ngồi
                        </button>
                    </div>
                )}
            </section>

            {/* ===== Đường dẫn tuỳ chỉnh ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiLink />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Đường dẫn tuỳ chỉnh</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">Tạo đường dẫn ngắn gọn cho sự kiện của bạn</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-6 py-2 rounded-xl bg-white/5 text-slate-400 text-sm whitespace-nowrap">
                            https://aipromo.online/event-detail/
                        </div>
                        <input
                            value={settingsForm.urlPath}
                            onChange={(e) => updateForm("urlPath", e.target.value)}
                            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary"
                        />
                        <button
                            type="button"
                            onClick={generateUrl}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white transition"
                        >
                            Tạo
                        </button>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm text-slate-500">
                            Ví dụ: aipromo.online/event-detail/hoi-thao-ai-2024
                        </p>
                        {errors.urlPath && (
                            <p className="text-red-400 text-sm">{errors.urlPath}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30"
                >
                    {isFormChanged() ? "Lưu và Tiếp tục →" : "Tiếp theo"}
                </button>
            </div>
        </div>
    );
}

function Toggle({ title, desc, checked, onChange }: {
    title: string; desc: string; checked: boolean; onChange: (value: boolean) => void;
}) {
    const id = `toggle-${title}`;
    return (
        <div className="flex items-center justify-between gap-6">
            <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>
            <div className="relative">
                <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
                <label htmlFor={id} className="w-11 h-6 rounded-full bg-white/10 peer-checked:bg-primary relative transition block cursor-pointer after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition peer-checked:after:translate-x-5" />
            </div>
        </div>
    );
}