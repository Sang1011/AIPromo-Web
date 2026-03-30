import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { GetEventDetailResponse } from "../../../types/event/event";
import type { AppDispatch } from "../../../store";
import { fetchUpdateEventPolicy, fetchRequestPublishEvent } from "../../../store/eventSlice";
import { notify } from "../../../utils/notify";
import { UnsavedBanner } from "../shared/UnsavedBanner";

interface PolicySection {
    title: string;
    items: string[];
}

interface Step4PolicyProps {
    onBack?: () => void;
    eventData?: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
    isAllowUpdate: boolean;
}

const defaultSections: PolicySection[] = [
    {
        title: "Điều kiện tham dự",
        items: [
            "Người tham dự phải mang theo vé hợp lệ hoặc mã QR để check-in.",
            "Không mang theo vật dụng nguy hiểm hoặc chất cấm vào khu vực sự kiện.",
            "Người tham dự cần tuân thủ hướng dẫn của ban tổ chức.",
        ],
    },
    {
        title: "Chính sách check-in",
        items: [
            "Cổng check-in mở trước giờ diễn ra sự kiện 30 phút.",
            "Người tham dự nên đến trước ít nhất 15 phút để hoàn tất thủ tục.",
            "Vé chỉ hợp lệ khi được quét mã QR tại khu vực check-in.",
        ],
    },
    {
        title: "Chính sách chuyển nhượng vé",
        items: [
            "Vé có thể được chuyển nhượng trước khi sự kiện diễn ra.",
            "Ban tổ chức không chịu trách nhiệm với các giao dịch mua bán vé giữa người tham dự.",
        ],
    },
    {
        title: "Điều khoản trách nhiệm",
        items: [
            "Ban tổ chức không chịu trách nhiệm đối với tài sản cá nhân bị mất hoặc hư hỏng.",
            "Người tham dự tự chịu trách nhiệm về hành vi và sự an toàn của mình trong suốt thời gian tham dự.",
        ],
    },
];

// Convert sections → HTML string gửi lên BE
const sectionsToHTML = (sections: PolicySection[]): string => {
    return sections
        .map(
            (sec, i) => `
<h3>${i + 1}. ${sec.title}</h3>
<ul>
${sec.items.map((item) => `<li>${item}</li>`).join("\n")}
</ul>`
        )
        .join("\n");
};

export default function Step4Policy({
    onBack,
    eventData,
    reloadEvent,
    isAllowUpdate,
}: Step4PolicyProps) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [sections, setSections] = useState<PolicySection[]>(defaultSections);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [isDirty, setIsDirty] = useState(false);
    const [bannerSaving, setBannerSaving] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        if (!mounted) { setMounted(true); return; }
        setIsDirty(true);
    }, [sections]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleBannerSave = async () => {
        setBannerSaving(true);
        try {
            await handleSave();
            setIsDirty(false);
        } finally {
            setBannerSaving(false);
        }
    };

    const isDraft = eventData?.status === "Draft";

    // ── helpers ──────────────────────────────────────────────
    const updateTitle = (si: number, value: string) => {
        setSections((prev) =>
            prev.map((s, i) => (i === si ? { ...s, title: value } : s))
        );
    };

    const updateItem = (si: number, ii: number, value: string) => {
        setSections((prev) =>
            prev.map((s, i) =>
                i === si
                    ? { ...s, items: s.items.map((it, j) => (j === ii ? value : it)) }
                    : s
            )
        );
    };

    const addItem = (si: number) => {
        setSections((prev) =>
            prev.map((s, i) =>
                i === si ? { ...s, items: [...s.items, ""] } : s
            )
        );
    };

    const removeItem = (si: number, ii: number) => {
        setSections((prev) =>
            prev.map((s, i) =>
                i === si
                    ? { ...s, items: s.items.filter((_, j) => j !== ii) }
                    : s
            )
        );
    };

    const addSection = () => {
        setSections((prev) => [...prev, { title: "", items: [""] }]);
    };

    const removeSection = (si: number) => {
        setSections((prev) => prev.filter((_, i) => i !== si));
    };

    // ── validation ───────────────────────────────────────────
    const validate = () => {
        for (const sec of sections) {
            if (!sec.title.trim()) {
                notify.warning("Tiêu đề điều khoản không được để trống");
                return false;
            }

            for (const item of sec.items) {
                if (!item.trim()) {
                    notify.warning("Nội dung điều khoản không được để trống");
                    return false;
                }
            }
        }
        return true;
    };

    // ── handlers ─────────────────────────────────────────────
    const handleSave = async () => {
        if (!eventData?.id) return;
        if (!validate()) return;

        const policy = sectionsToHTML(sections);
        setLoading(true);
        try {
            await dispatch(fetchUpdateEventPolicy({ eventId: eventData.id, policy })).unwrap();
            await reloadEvent?.();
            notify.success("Lưu chính sách thành công!");
            setIsDirty(false);
        } catch (err) {
            notify.error("Lưu chính sách thất bại");
            throw new Error("save_failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPublish = async () => {
        if (!eventData?.id) return;
        if (!validate()) return;

        setPublishing(true);
        try {
            await handleSave();
            await dispatch(fetchRequestPublishEvent(eventData.id)).unwrap();
            notify.success("Gửi yêu cầu duyệt thành công!");
            localStorage.removeItem(`editEventStep_${eventData.id}`);
            navigate("/organizer/my-events");
        } catch {
            notify.error("Gửi yêu cầu duyệt thất bại");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-8">
            {isDirty && isAllowUpdate && (
                <UnsavedBanner onSave={handleBannerSave} saving={bannerSaving} />
            )}
            <div>
                <h2 className="text-xl font-semibold text-white">Chính sách sự kiện</h2>
                <p className="text-sm text-slate-400 mt-1">
                    Thiết lập các điều khoản dành cho người tham dự sự kiện.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map((sec, si) => (
                    <section
                        key={si}
                        className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-4"
                    >
                        {/* Section header */}
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm font-semibold w-6 shrink-0">
                                {si + 1}.
                            </span>
                            <input
                                type="text"
                                value={sec.title}
                                onChange={(e) => updateTitle(si, e.target.value)}
                                placeholder="Tiêu đề điều khoản..."
                                readOnly={!isAllowUpdate}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            {sections.length > 1 && (
                                <button
                                    onClick={() => removeSection(si)}
                                    disabled={!isAllowUpdate}
                                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Xóa mục
                                </button>
                            )}
                        </div>

                        {/* Items */}
                        <div className="space-y-2 pl-9">
                            {sec.items.map((item, ii) => (
                                <div key={ii} className="flex items-center gap-2">
                                    <span className="text-slate-500 text-xs w-4 shrink-0">•</span>
                                    <input
                                        type="text"
                                        value={item}
                                        onChange={(e) => updateItem(si, ii, e.target.value)}
                                        placeholder="Nội dung điều khoản..."
                                        readOnly={!isAllowUpdate}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                    {sec.items.length > 1 && (
                                        <button
                                            onClick={() => removeItem(si, ii)}
                                            disabled={!isAllowUpdate}
                                            className="text-slate-500 hover:text-red-400 transition text-lg leading-none disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={() => addItem(si)}
                                disabled={!isAllowUpdate}
                                className="text-violet-400 hover:text-violet-300 text-xs mt-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                + Thêm dòng
                            </button>
                        </div>
                    </section>
                ))}
            </div>

            {/* Add section */}
            <button
                onClick={addSection}
                disabled={!isAllowUpdate}
                className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-slate-400 hover:text-white hover:border-violet-500 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-white/10"
            >
                + Thêm điều khoản
            </button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
                {/* Nút quay lại — KHÔNG disable */}
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>

                <div className="flex items-center gap-3">
                    {isDraft && (
                        <button
                            onClick={handleRequestPublish}
                            disabled={publishing || !isAllowUpdate}
                            className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {publishing ? "Đang gửi..." : "Lưu và gửi yêu cầu duyệt"}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || !isAllowUpdate}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                </div>
            </div>
        </div>
    );
}