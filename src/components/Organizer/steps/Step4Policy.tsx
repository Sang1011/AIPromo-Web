import { useState } from "react";
import Editor from "../shared/Editor";

interface Step4PolicyProps {
    onBack?: () => void;
    onNext?: () => void;
}

export default function Step4Policy({
    onBack,
    onNext,
}: Step4PolicyProps) {

    const defaultPolicy = `
            <h3>Chính sách sự kiện</h3>

            <h4>1. Điều kiện tham dự</h4>
            <ul>
            <li>Người tham dự phải mang theo vé hợp lệ hoặc mã QR để check-in.</li>
            <li>Không mang theo vật dụng nguy hiểm hoặc chất cấm vào khu vực sự kiện.</li>
            <li>Người tham dự cần tuân thủ hướng dẫn của ban tổ chức.</li>
            </ul>

            <h4>2. Chính sách check-in</h4>
            <ul>
            <li>Cổng check-in mở trước giờ diễn ra sự kiện 30 phút.</li>
            <li>Người tham dự nên đến trước ít nhất 15 phút để hoàn tất thủ tục.</li>
            <li>Vé chỉ hợp lệ khi được quét mã QR tại khu vực check-in.</li>
            </ul>

            <h4>3. Chính sách chuyển nhượng vé</h4>
            <ul>
            <li>Vé có thể được chuyển nhượng trước khi sự kiện diễn ra.</li>
            <li>Ban tổ chức không chịu trách nhiệm với các giao dịch mua bán vé giữa người tham dự.</li>
            </ul>

            <h4>4. Điều khoản trách nhiệm</h4>
            <ul>
            <li>Ban tổ chức không chịu trách nhiệm đối với tài sản cá nhân bị mất hoặc hư hỏng.</li>
            <li>Người tham dự tự chịu trách nhiệm về hành vi và sự an toàn của mình trong suốt thời gian tham dự sự kiện.</li>
            </ul>
        `;

    const [policy, setPolicy] = useState(defaultPolicy);

    return (
        <div className="space-y-8">

            {/* ===== Header ===== */}
            <div>
                <h2 className="text-xl font-semibold text-white">
                    Chính sách sự kiện
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Thiết lập các điều khoản dành cho người tham dự sự kiện.
                </p>
            </div>

            {/* ===== Policy Editor ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-4">

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                        Nội dung chính sách
                    </h3>
                </div>

                <p className="text-sm text-slate-400">
                    Bạn có thể thiết lập các nội dung như điều kiện tham dự, chính sách check-in,
                    chuyển nhượng vé và điều khoản trách nhiệm.
                </p>

                {/* <Editor
                    value={policy}
                    onChange={setPolicy}
                /> */}

            </section>

            {/* ===== Footer ===== */}
            <div className="flex items-center justify-between pt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                    Quay lại
                </button>

                <button
                    onClick={onNext}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold"
                >
                    Tiếp theo
                </button>
            </div>

        </div>
    );
}