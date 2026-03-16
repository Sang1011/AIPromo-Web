import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Editor from "../shared/Editor";
import type { GetEventDetailResponse } from "../../../types/event/event";
import type { AppDispatch } from "../../../store";
import { fetchUpdateEventPolicy, fetchRequestPublishEvent } from "../../../store/eventSlice";
import { notify } from "../../../utils/notify"; // adjust path

interface Step4PolicyProps {
    onBack?: () => void;
    onNext?: () => void;
    eventData?: GetEventDetailResponse | null;
    reloadEvent?: () => Promise<void>;
}

const defaultPolicy = `
<h2>Chính sách sự kiện</h2>

<h3>1. Điều kiện tham dự</h3>
<ul>
<li>Người tham dự phải mang theo vé hợp lệ hoặc mã QR để check-in.</li>
<li>Không mang theo vật dụng nguy hiểm hoặc chất cấm vào khu vực sự kiện.</li>
<li>Người tham dự cần tuân thủ hướng dẫn của ban tổ chức.</li>
</ul>

<h3>2. Chính sách check-in</h3>
<ul>
<li>Cổng check-in mở trước giờ diễn ra sự kiện 30 phút.</li>
<li>Người tham dự nên đến trước ít nhất 15 phút để hoàn tất thủ tục.</li>
<li>Vé chỉ hợp lệ khi được quét mã QR tại khu vực check-in.</li>
</ul>

<h3>3. Chính sách chuyển nhượng vé</h3>
<ul>
<li>Vé có thể được chuyển nhượng trước khi sự kiện diễn ra.</li>
<li><b>Ban tổ chức không chịu trách nhiệm</b> với các giao dịch mua bán vé giữa người tham dự.</li>
</ul>

<h3>4. Điều khoản trách nhiệm</h3>
<ul>
<li><b>Ban tổ chức không chịu trách nhiệm</b> đối với tài sản cá nhân bị mất hoặc hư hỏng.</li>
<li>Người tham dự tự chịu trách nhiệm về hành vi và sự an toàn của mình trong suốt thời gian tham dự.</li>
</ul>
`;

export default function Step4Policy({
    onBack,
    onNext,
    eventData,
    reloadEvent,
}: Step4PolicyProps) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(eventData?.policy || defaultPolicy);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const isDraft = eventData?.status === "Draft";

    const handleSave = async () => {
        if (!eventData?.id) return;
        const stripped = policy.replace(/<[^>]*>/g, "").trim();
        if (!stripped) {
            notify.warning("Chính sách không được để trống");
            return;
        }

        setLoading(true);
        try {
            await dispatch(fetchUpdateEventPolicy(eventData.id)).unwrap();
            await reloadEvent?.();
            notify.success("Lưu chính sách thành công!");
        } catch {
            notify.error("Lưu chính sách thất bại");
            throw new Error("save_failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPublish = async () => {
        if (!eventData?.id) return;

        const stripped = policy.replace(/<[^>]*>/g, "").trim();
        if (!stripped) {
            notify.warning("Chính sách không được để trống");
            return;
        }

        setPublishing(true);
        try {
            await handleSave();
            await dispatch(fetchRequestPublishEvent(eventData.id)).unwrap();
            notify.success("Gửi yêu cầu duyệt thành công!");
            navigate("/organizer/my-events");
        } catch {
            notify.error("Gửi yêu cầu duyệt thất bại");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Chính sách sự kiện
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Thiết lập các điều khoản dành cho người tham dự sự kiện.
                </p>
            </div>

            {/* Policy Editor */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                        Nội dung chính sách
                    </h3>
                </div>
                <p className="text-sm text-slate-400">
                    Bạn có thể thiết lập các nội dung như điều kiện tham dự, chính sách
                    check-in, chuyển nhượng vé và điều khoản trách nhiệm.
                </p>
                <Editor value={policy} onChange={setPolicy} />
            </section>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
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
                            disabled={publishing}
                            className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {publishing ? "Đang gửi..." : "Yêu cầu duyệt"}
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                </div>
            </div>
        </div>
    );
}