import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiEye, FiImage, FiLink, FiMap, FiPlus, FiUpload, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch } from "../../../store";
import { fetchEventById, fetchUpdateEventSettings, fetchUpload } from "../../../store/eventSlice";
import { fetchGetSeatMap } from "../../../store/seatMapSlice";
import type { EventSession, GetEventDetailResponse } from "../../../types/event/event";
import { notify } from "../../../utils/notify";
import ImageViewer from "../shared/ImagePreview";
import { UnsavedBanner } from "../shared/UnsavedBanner";
import type { SeatMapData } from "../../../types/config/seatmap";
import SeatMapReadOnly from "../seatmap/SeatMapReadOnly";

interface Step3SettingsProps {
    onNext?: () => void;
    onBack?: () => void;
    eventData: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
    isAllowUpdate?: boolean;
}

type EventSettingsForm = {
    isEmailReminderEnabled: boolean;
    urlPath: string;
    specImage: string;
};

export default function Step3Settings({
    onNext, onBack, eventData, reloadEvent, isAllowUpdate = true,
}: Step3SettingsProps) {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [settingsForm, setSettingsForm] = useState<EventSettingsForm>({
        isEmailReminderEnabled: false,
        urlPath: "",
        specImage: "",
    });
    const [initialForm, setInitialForm] = useState<EventSettingsForm | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof EventSettingsForm, string>>>({});

    // Local file preview (chưa upload)
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [viewerOpen, setViewerOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Seatmap
    const [seatMapSpec, setSeatMapSpec] = useState<string | null>(null);
    const [parsedSeatMap, setParsedSeatMap] = useState<SeatMapData | null>(null);
    const [seatMapLoading, setSeatMapLoading] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        setSeatMapLoading(true);
        dispatch(fetchEventById(eventId))
            .unwrap()
            .then((res) => {
                const sessions: EventSession[] = res.data?.sessions ?? [];
                const firstSession = sessions[0];
                if (!firstSession) { setSeatMapSpec(null); setSeatMapLoading(false); return; }
                dispatch(fetchGetSeatMap({ eventId, sessionId: firstSession.id }))
                    .unwrap()
                    .then((spec) => {
                        setSeatMapSpec(spec ?? null);
                        if (spec) {
                            try { setParsedSeatMap(JSON.parse(spec)); } catch { setParsedSeatMap(null); }
                        }
                    })
                    .catch(() => setSeatMapSpec(null))
                    .finally(() => setSeatMapLoading(false));
            })
            .catch(() => { setSeatMapSpec(null); setSeatMapLoading(false); });
    }, [eventId]);

    const hasSeatMap = !!seatMapSpec;

    const updateForm = <K extends keyof EventSettingsForm>(key: K, value: EventSettingsForm[K]) =>
        setSettingsForm(prev => ({ ...prev, [key]: value }));

    const validateForm = () => {
        if (!isAllowUpdate) return true;

        const newErrors: Partial<Record<keyof EventSettingsForm, string>> = {};

        if (!settingsForm.urlPath) {
            newErrors.urlPath = "Vui lòng nhập đường dẫn tùy chỉnh";
        } else {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(settingsForm.urlPath))
                newErrors.urlPath = "URL chỉ được chứa chữ thường, số và dấu gạch ngang";
        }

        setErrors(newErrors);

        const hasImage = !!pendingFile || !!settingsForm.specImage;
        if (!hasImage && !hasSeatMap) {
            notify.error("Vui lòng tải lên ảnh sơ đồ hoặc thiết lập sơ đồ chỗ ngồi");
            return false;
        }

        return Object.keys(newErrors).length === 0;
    };

    const isFormChanged = () => {
        if (!initialForm) return true;
        return JSON.stringify(initialForm) !== JSON.stringify(settingsForm) || !!pendingFile;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate 10MB
        if (file.size > 10 * 1024 * 1024) {
            notify.error("Ảnh không được vượt quá 10MB");
            e.target.value = "";
            return;
        }

        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        e.target.value = "";
    };

    const removeImage = () => {
        setPendingFile(null);
        setPreviewUrl("");
        updateForm("specImage", "");
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!isFormChanged()) { onNext?.(); return; }
        if (!eventId) return;

        try {
            let finalSpecImageUrl = settingsForm.specImage;

            // Upload ảnh mới nếu có
            if (pendingFile) {
                setUploading(true);
                finalSpecImageUrl = await dispatch(fetchUpload({
                    folder: "spec-images",
                    file: pendingFile,
                })).unwrap();
                setUploading(false);
                setPendingFile(null);
                setPreviewUrl(finalSpecImageUrl);
                updateForm("specImage", finalSpecImageUrl);
            }

            if (isAllowUpdate) {
                await dispatch(fetchUpdateEventSettings({
                    eventId,
                    data: {
                        ...settingsForm,
                        specImage: finalSpecImageUrl,
                        ticketSaleStartAt: eventData?.ticketSaleStartAt ?? "",
                        ticketSaleEndAt: eventData?.ticketSaleEndAt ?? "",
                        eventStartAt: eventData?.eventStartAt ?? "",
                        eventEndAt: eventData?.eventEndAt ?? "",
                    }
                })).unwrap();

            } else {
                await dispatch(fetchUpdateEventSettings({
                    eventId,
                    data: {
                        isEmailReminderEnabled: settingsForm.isEmailReminderEnabled,
                    }
                })).unwrap();
            }

            await reloadEvent?.();
            notify.success("Đã lưu cài đặt sự kiện");
            onNext?.();
        } catch (err: any) {
            setUploading(false);
            const code = err?.code ?? err?.errorCode ?? err?.message ?? "";
            if (typeof code === "string" && code.toLowerCase().includes("urlpath")) {
                notify.error("Đường dẫn URL đã tồn tại, vui lòng chọn đường dẫn khác");
                setErrors(prev => ({ ...prev, urlPath: "Đường dẫn này đã được sử dụng" }));
            } else {
                notify.error("Không thể lưu cài đặt sự kiện");
            }
        }
    };

    const generateUrl = () => {
        if (!eventData?.title) { notify.error("Không tìm thấy tên sự kiện để tạo URL"); return; }
        const slug = eventData.title
            .toLowerCase().normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "").trim()
            .replace(/\s+/g, "-").replace(/-+/g, "-");
        updateForm("urlPath", slug);
    };

    useEffect(() => {
        if (!eventData || initialForm) return;
        const newForm = {
            isEmailReminderEnabled: eventData.isEmailReminderEnabled ?? false,
            urlPath: eventData.urlPath ?? "",
            specImage: (eventData as any).specImage ?? "",
        };
        setSettingsForm(newForm);
        setInitialForm(newForm);
        if (newForm.specImage) setPreviewUrl(newForm.specImage);
    }, [eventData]);

    const displayImage = previewUrl || settingsForm.specImage;
    const isDirty = isFormChanged();

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const [bannerSaving, setBannerSaving] = useState(false);

    const handleBannerSave = async () => {
        if (!validateForm()) return;
        if (!eventId) return;
        setBannerSaving(true);
        try {
            let finalSpecImageUrl = settingsForm.specImage;
            if (pendingFile) {
                setUploading(true);
                finalSpecImageUrl = await dispatch(fetchUpload({
                    folder: "spec-images",
                    file: pendingFile,
                })).unwrap();
                setUploading(false);
                setPendingFile(null);
                setPreviewUrl(finalSpecImageUrl);
                updateForm("specImage", finalSpecImageUrl);
            }
            await dispatch(fetchUpdateEventSettings({
                eventId,
                data: {
                    ...settingsForm,
                    specImage: finalSpecImageUrl,
                    ticketSaleStartAt: eventData?.ticketSaleStartAt ?? "",
                    ticketSaleEndAt: eventData?.ticketSaleEndAt ?? "",
                    eventStartAt: eventData?.eventStartAt ?? "",
                    eventEndAt: eventData?.eventEndAt ?? "",
                }
            })).unwrap();
            await reloadEvent?.();
            setInitialForm({ ...settingsForm, specImage: finalSpecImageUrl });
            notify.success("Đã lưu cài đặt sự kiện");
        } catch {
            notify.error("Không thể lưu cài đặt sự kiện");
        } finally {
            setBannerSaving(false);
            setUploading(false);
        }
    };
    return (
        <div className="space-y-8">
            {isDirty && isAllowUpdate && (
                <UnsavedBanner onSave={handleBannerSave} saving={bannerSaving} />
            )}

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiMap />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Sơ đồ chỗ ngồi</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Chọn một trong hai hình thức để hiển thị sơ đồ cho người mua vé</p>
                    </div>
                </div>

                {/* Divider + label */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest">Chọn hình thức</span>
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all
            ${hasSeatMap
                            ? "border-emerald-500/40 bg-emerald-500/5"
                            : "border-white/8 bg-white/[0.02]"}
            ${!hasSeatMap && isAllowUpdate ? "hover:border-white/15" : ""}
        `}>
                        {hasSeatMap && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-semibold uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Đang dùng
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${hasSeatMap ? "bg-emerald-500/15" : "bg-white/5"}`}>
                                <FiMap size={16} className={hasSeatMap ? "text-emerald-400" : "text-slate-400"} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Sơ đồ trực quan</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Tạo sơ đồ ghế tương tác, người mua vé chọn ghế trực tiếp
                                </p>
                            </div>
                        </div>

                        {seatMapLoading ? (
                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                Đang tải...
                            </div>
                        ) : hasSeatMap ? (
                            <>
                                {parsedSeatMap && (
                                    <div className="w-full h-80 rounded-xl overflow-hidden border border-white/8">
                                        <SeatMapReadOnly
                                            seatMapData={parsedSeatMap}
                                            ticketTypes={eventData?.ticketTypes ?? []}
                                        />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    disabled={!isAllowUpdate}
                                    onClick={() => navigate(`/organizer/my-events/${eventId}/seat-map/edit`, { state: { from: "edit" } })}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-xs text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FiEdit2 size={13} />
                                    Chỉnh sửa sơ đồ
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                disabled={!isAllowUpdate}
                                onClick={() => navigate(`/organizer/my-events/${eventId}/seat-map/edit`, { state: { from: "edit" } })}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FiPlus size={13} />
                                Tạo sơ đồ
                            </button>
                        )}
                    </div>

                    <div className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all
            ${displayImage && !hasSeatMap
                            ? "border-primary/40 bg-primary/5"
                            : "border-white/8 bg-white/[0.02]"}
            ${!displayImage && isAllowUpdate ? "hover:border-white/15" : ""}
        `}>
                        {displayImage && !hasSeatMap && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary text-[10px] font-semibold uppercase tracking-wide">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Đang dùng
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${displayImage && !hasSeatMap ? "bg-primary/15" : "bg-white/5"}`}>
                                <FiImage size={16} className={displayImage && !hasSeatMap ? "text-primary" : "text-slate-400"} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Ảnh sơ đồ</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Tải lên ảnh sơ đồ tĩnh để hiển thị cho người mua vé
                                </p>
                            </div>
                        </div>

                        {displayImage ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/8">
                                {/* Thumbnail */}
                                <button
                                    type="button"
                                    onClick={() => setViewerOpen(true)}
                                    className="relative w-14 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 group"
                                >
                                    <img src={displayImage} alt="Spec" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <FiEye size={13} className="text-white" />
                                    </div>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">
                                        {pendingFile ? pendingFile.name : "Ảnh sơ đồ"}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {pendingFile ? "Chưa lưu" : "Đã lưu"}
                                    </p>
                                </div>
                                {isAllowUpdate && (
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-slate-400 hover:text-white transition"
                                            title="Đổi ảnh"
                                        >
                                            <FiUpload size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition"
                                            title="Xóa ảnh"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => isAllowUpdate && fileInputRef.current?.click()}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all
                        ${isAllowUpdate
                                        ? "bg-white/5 hover:bg-white/10 border-white/10 text-white cursor-pointer"
                                        : "border-white/5 text-slate-600 cursor-not-allowed opacity-50"}
                    `}
                            >
                                <FiUpload size={13} />
                                Tải lên ảnh sơ đồ
                            </div>
                        )}
                    </div>
                </div>

                {/* Note: chỉ cần 1 trong 2 */}
                <p className="text-xs text-slate-600 mt-4 text-center">
                    Chỉ cần thiết lập một trong hai hình thức — sơ đồ trực quan sẽ được ưu tiên nếu cả hai đều có
                </p>
            </section>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

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
                            readOnly={!isAllowUpdate}
                            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={generateUrl}
                            disabled={!isAllowUpdate}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Tạo
                        </button>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-sm text-slate-500">Ví dụ: aipromo.online/event-detail/hoi-thao-ai-2024</p>
                        {errors.urlPath && <p className="text-red-400 text-sm">{errors.urlPath}</p>}
                    </div>
                </div>
            </section>

            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {uploading ? "Đang tải ảnh..." : isFormChanged() ? "Lưu và Tiếp tục →" : "Tiếp theo"}
                </button>
            </div>

            {/* Image Viewer Popup */}
            {viewerOpen && displayImage && (
                <ImageViewer url={displayImage} onClose={() => setViewerOpen(false)} />
            )}
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