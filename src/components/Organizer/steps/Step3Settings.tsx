import { FiEye, FiLock, FiLink, FiInfo } from "react-icons/fi";
import DateTimeInput from "../shared/DateTimeInput";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchUpdateEventSettings } from "../../../store/eventSlice";
import type { GetEventDetailResponse } from "../../../types/event/event";

interface Step3SettingsProps {
    onNext?: () => void;
    onBack?: () => void;
    eventData: GetEventDetailResponse | null;
}

type EventSettingsForm = {
    isEmailReminderEnabled: boolean;
    urlPath: string;
    ticketSaleStartAt: string;
    ticketSaleEndAt: string;
    eventStartAt: string;
    eventEndAt: string;
};

export default function Step3Settings({
    onNext,
    onBack,
    eventData
}: Step3SettingsProps) {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const [settingsForm, setSettingsForm] = useState<EventSettingsForm>({
        isEmailReminderEnabled: false,
        urlPath: "",
        ticketSaleStartAt: "",
        ticketSaleEndAt: "",
        eventStartAt: "",
        eventEndAt: "",
    });

    const updateForm = <K extends keyof EventSettingsForm>(
        key: K,
        value: EventSettingsForm[K]
    ) => {
        setSettingsForm(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const toLocalDateTime = (iso: string) => {
        return new Date(iso).toISOString().slice(0, 16);
    };

    const toUTC = (local: string) => {
        return new Date(local).toISOString();
    };

    const handleSubmit = async () => {
        const payload = {
            ...settingsForm,
            ticketSaleStartAt: toUTC(settingsForm.ticketSaleStartAt),
            ticketSaleEndAt: toUTC(settingsForm.ticketSaleEndAt),
            eventStartAt: toUTC(settingsForm.eventStartAt),
            eventEndAt: toUTC(settingsForm.eventEndAt),
        };
        console.log(payload);
        if (!eventId) return;
        await dispatch(fetchUpdateEventSettings({ eventId: eventId, data: payload }));
    };

    const handleNext = () => {
        handleSubmit();
        onNext?.();
    }

    useEffect(() => {
        if (!eventData) return;

        setSettingsForm({
            isEmailReminderEnabled: eventData.isEmailReminderEnabled ?? false,
            urlPath: eventData.urlPath ?? "",

            ticketSaleStartAt: eventData.ticketSaleStartAt
                ? toLocalDateTime(eventData.ticketSaleStartAt)
                : "",

            ticketSaleEndAt: eventData.ticketSaleEndAt
                ? toLocalDateTime(eventData.ticketSaleEndAt)
                : "",

            eventStartAt: eventData.eventStartAt
                ? toLocalDateTime(eventData.eventStartAt)
                : "",

            eventEndAt: eventData.eventEndAt
                ? toLocalDateTime(eventData.eventEndAt)
                : "",
        });
    }, [eventData]);

    return (
        <div className="space-y-8">

            {/* ===== Hiển thị thông tin ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiEye />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Cài đặt tùy chỉnh
                    </h2>
                </div>

                <div className="space-y-5">
                    <Toggle
                        title="Tự động gửi email nhắc nhở"
                        desc="Gửi thông báo cho người tham dự 24h trước khi sự kiện diễn ra."
                        checked={settingsForm.isEmailReminderEnabled}
                        onChange={(v) => updateForm("isEmailReminderEnabled", v)}
                    />
                </div>
            </section>

            {/* ===== Thời gian bán vé ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiLock />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Thời gian bán vé
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <DateTimeInput
                        label="Bắt đầu bán vé"
                        value={settingsForm.ticketSaleStartAt}
                        onChange={(v) => updateForm("ticketSaleStartAt", v)}
                    />

                    <DateTimeInput
                        label="Kết thúc bán vé"
                        value={settingsForm.ticketSaleEndAt}
                        onChange={(v) => updateForm("ticketSaleEndAt", v)}
                    />
                </div>
            </section>

            {/* ===== Thời gian sự kiện ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiInfo />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Thời gian sự kiện
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <DateTimeInput
                        label="Bắt đầu sự kiện"
                        value={settingsForm.eventStartAt}
                        onChange={(v) => updateForm("eventStartAt", v)}
                    />

                    <DateTimeInput
                        label="Kết thúc sự kiện"
                        value={settingsForm.eventEndAt}
                        onChange={(v) => updateForm("eventEndAt", v)}
                    />
                </div>
            </section>

            {/* ===== Đường dẫn tuỳ chỉnh ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiLink />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Đường dẫn tuỳ chỉnh
                    </h2>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    Tạo đường dẫn ngắn gọn cho sự kiện của bạn
                </p>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-sm">
                        aipromo.online/event-detail/
                    </div>
                    <input
                        value={settingsForm.urlPath}
                        onChange={(e) => updateForm("urlPath", e.target.value)}
                        className="
        flex-1 px-4 py-2 rounded-xl
        bg-white/5 border border-white/10
        text-white outline-none
        focus:border-primary
    "
                    />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    Ví dụ: aipromo.online/event-detail/hoi-thao-ai-2024
                </p>
            </section>

            {/* ===== Footer action ===== */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>

                <button
                    onClick={() => handleNext()}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30"
                >
                    Lưu và Tiếp tục →
                </button>
            </div>
        </div>
    );
}

function Toggle({
    title,
    desc,
    checked,
    onChange,
}: {
    title: string;
    desc: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {

    const id = `toggle-${title}`;

    return (
        <div className="flex items-center justify-between gap-6">
            <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>

            <div className="relative">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer sr-only"
                />

                <label
                    htmlFor={id}
                    className="
                        w-11 h-6 rounded-full
                        bg-white/10
                        peer-checked:bg-primary
                        relative transition
                        block cursor-pointer
                        after:content-['']
                        after:absolute after:top-0.5 after:left-0.5
                        after:w-5 after:h-5
                        after:bg-white after:rounded-full
                        after:transition
                        peer-checked:after:translate-x-5
                    "
                />
            </div>
        </div>
    );
}