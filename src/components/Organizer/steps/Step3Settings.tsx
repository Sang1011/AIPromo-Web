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
    const [initialForm, setInitialForm] = useState<EventSettingsForm | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof EventSettingsForm, string>>>({});

    const updateForm = <K extends keyof EventSettingsForm>(
        key: K,
        value: EventSettingsForm[K]
    ) => {
        setSettingsForm(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof EventSettingsForm, string>> = {};

        if (!settingsForm.ticketSaleStartAt)
            newErrors.ticketSaleStartAt = "Vui lòng chọn thời gian bắt đầu bán vé";

        if (!settingsForm.ticketSaleEndAt)
            newErrors.ticketSaleEndAt = "Vui lòng chọn thời gian kết thúc bán vé";

        if (!settingsForm.eventStartAt)
            newErrors.eventStartAt = "Vui lòng chọn thời gian bắt đầu sự kiện";

        if (!settingsForm.eventEndAt)
            newErrors.eventEndAt = "Vui lòng chọn thời gian kết thúc sự kiện";

        if (settingsForm.urlPath) {
            const slugRegex = /^[a-z0-9-]+$/;

            if (!slugRegex.test(settingsForm.urlPath)) {
                newErrors.urlPath =
                    "URL chỉ được chứa chữ thường, số và dấu gạch ngang";
            }
        }

        if (
            settingsForm.ticketSaleStartAt &&
            settingsForm.ticketSaleEndAt &&
            new Date(settingsForm.ticketSaleStartAt) >=
            new Date(settingsForm.ticketSaleEndAt)
        ) {
            newErrors.ticketSaleEndAt =
                "Thời gian kết thúc bán vé phải sau thời gian bắt đầu";
        }

        if (
            settingsForm.ticketSaleEndAt &&
            settingsForm.eventStartAt &&
            new Date(settingsForm.ticketSaleEndAt) >
            new Date(settingsForm.eventStartAt)
        ) {
            newErrors.eventStartAt =
                "Sự kiện phải bắt đầu sau khi kết thúc bán vé";
        }

        if (
            settingsForm.eventStartAt &&
            settingsForm.eventEndAt &&
            new Date(settingsForm.eventStartAt) >=
            new Date(settingsForm.eventEndAt)
        ) {
            newErrors.eventEndAt =
                "Thời gian kết thúc sự kiện phải sau thời gian bắt đầu";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const toLocalDateTime = (iso: string) => {
        const date = new Date(iso);
        const offset = date.getTimezoneOffset() * 60000;

        return new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16);
    };

    const isFormChanged = () => {
        if (!initialForm) return true;

        return JSON.stringify(initialForm) !== JSON.stringify(settingsForm);
    };

    const toUTC = (local: string) => {
        return new Date(local).toISOString();
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        if (!isFormChanged()) {
            onNext?.();
            return;
        }

        const payload = {
            ...settingsForm,
            ticketSaleStartAt: toUTC(settingsForm.ticketSaleStartAt),
            ticketSaleEndAt: toUTC(settingsForm.ticketSaleEndAt),
            eventStartAt: toUTC(settingsForm.eventStartAt),
            eventEndAt: toUTC(settingsForm.eventEndAt),
        };

        if (!eventId) return;

        await dispatch(fetchUpdateEventSettings({ eventId, data: payload }));
        onNext?.();
    };

    useEffect(() => {
        if (!eventData) return;

        const newForm = {
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
        };

        setSettingsForm(newForm);
        setInitialForm(newForm);
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

                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Bắt đầu bán vé"
                            value={settingsForm.ticketSaleStartAt}
                            onChange={(v) => updateForm("ticketSaleStartAt", v)}
                        />

                        {errors.ticketSaleStartAt && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.ticketSaleStartAt}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Kết thúc bán vé"
                            value={settingsForm.ticketSaleEndAt}
                            onChange={(v) => updateForm("ticketSaleEndAt", v)}
                        />

                        {errors.ticketSaleEndAt && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.ticketSaleEndAt}
                            </p>
                        )}
                    </div>

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

                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Bắt đầu sự kiện"
                            value={settingsForm.eventStartAt}
                            onChange={(v) => updateForm("eventStartAt", v)}
                        />
                        {errors.eventStartAt && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.eventStartAt}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <DateTimeInput
                            label="Kết thúc sự kiện"
                            value={settingsForm.eventEndAt}
                            onChange={(v) => updateForm("eventEndAt", v)}
                        />
                        {errors.eventEndAt && (
                            <p className="text-red-400 text-xs mt-1">
                                {errors.eventEndAt}
                            </p>
                        )}
                    </div>
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

                <div className="space-y-2">

                    <div className="flex items-center gap-3">
                        <div className="px-6 py-2 rounded-xl bg-white/5 text-slate-400 text-sm whitespace-nowrap">
                            https://aipromo.online/event-detail/
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

                    <div className="flex justify-between">
                        <p className="text-sm text-slate-500">
                            Ví dụ: aipromo.online/event-detail/hoi-thao-ai-2024
                        </p>

                        {errors.urlPath && (
                            <p className="text-red-400 text-sm">
                                {errors.urlPath}
                            </p>
                        )}
                    </div>

                </div>
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
                    onClick={() => handleSubmit()}
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