import { FiEye, FiLock, FiLink, FiInfo } from "react-icons/fi";

interface Step3SettingsProps {
    onNext?: () => void;
    onBack?: () => void;
}

export default function Step3Settings({
    onNext,
    onBack,
}: Step3SettingsProps) {
    return (
        <div className="space-y-8">

            {/* ===== Quyền riêng tư ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiLock />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Quyền riêng tư
                    </h2>
                </div>

                <div className="space-y-4">
                    {/* Public */}
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 cursor-pointer border border-primary/40">
                        <input
                            type="radio"
                            name="privacy"
                            defaultChecked
                            className="mt-1 accent-primary"
                        />
                        <div>
                            <p className="font-medium text-white">
                                Công khai (Public)
                            </p>
                            <p className="text-sm text-slate-400">
                                Sự kiện sẽ hiển thị trên trang chủ và kết quả tìm kiếm của AIPromo.
                            </p>
                        </div>
                    </label>

                    {/* Private */}
                    <label className="flex items-start gap-4 p-4 rounded-xl bg-white/5 cursor-pointer">
                        <input
                            type="radio"
                            name="privacy"
                            className="mt-1 accent-primary"
                        />
                        <div>
                            <p className="font-medium text-white">
                                Riêng tư (Private)
                            </p>
                            <p className="text-sm text-slate-400">
                                Chỉ những người có đường dẫn trực tiếp mới có thể xem và mua vé.
                            </p>
                        </div>
                    </label>
                </div>
            </section>

            {/* ===== Hiển thị thông tin ===== */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <FiEye />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Hiển thị thông tin
                    </h2>
                </div>

                <div className="space-y-5">
                    <Toggle
                        title="Hiển thị số lượng vé còn lại"
                        desc="Người mua sẽ thấy số vé còn tồn kho trên trang sự kiện."
                        defaultChecked
                    />
                    <Toggle
                        title="Công khai danh sách tham dự"
                        desc="Hiển thị ảnh đại diện và tên của những người đã mua vé."
                    />
                    <Toggle
                        title="Tự động gửi email nhắc nhở"
                        desc="Gửi thông báo cho người tham dự 24h trước khi sự kiện diễn ra."
                        defaultChecked
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
                        aipromo.vn/e/
                    </div>
                    <input
                        placeholder="techvision-2024"
                        className="
                            flex-1 px-4 py-2 rounded-xl
                            bg-white/5 border border-white/10
                            text-white outline-none
                            focus:border-primary
                        "
                    />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                    Ví dụ: aipromo.vn/e/hoi-thao-ai-2024
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
                    onClick={onNext}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30"
                >
                    Lưu và Tiếp tục →
                </button>
            </div>
        </div>
    );
}

/* ===== Toggle component ===== */
function Toggle({
    title,
    desc,
    defaultChecked = false,
}: {
    title: string;
    desc: string;
    defaultChecked?: boolean;
}) {
    return (
        <label className="flex items-center justify-between gap-6 cursor-pointer">
            <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>

            <input
                type="checkbox"
                defaultChecked={defaultChecked}
                className="
                    w-11 h-6 rounded-full appearance-none
                    bg-white/10 checked:bg-primary
                    relative transition
                    after:content-['']
                    after:absolute after:top-0.5 after:left-0.5
                    after:w-5 after:h-5 after:bg-white after:rounded-full
                    after:transition checked:after:translate-x-5
                "
            />
        </label>
    );
}
