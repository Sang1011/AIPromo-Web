import { useState } from "react";

interface Step1EventInfoProps {
    onNext: () => void;
    onCancel: () => void;
}

export default function Step1EventInfo({
    onNext,
    onCancel,
}: Step1EventInfoProps) {
    const [bannerVertical, setBannerVertical] = useState<File | null>(null);
    const [bannerHorizontal, setBannerHorizontal] = useState<File | null>(null);
    const [orgLogo, setOrgLogo] = useState<File | null>(null);

    const preview = (file: File | null) =>
        file ? URL.createObjectURL(file) : null;

    return (
        <div className="space-y-8">

            {/* ================= Hình ảnh sự kiện ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="font-semibold text-white">
                        * Hình ảnh sự kiện
                    </h3>
                    <button className="text-primary text-sm">
                        Xem vị trí hiển thị
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Banner dọc */}
                    <UploadBox
                        label="Banner dọc (3:4)"
                        aspect="3/4"
                        file={bannerVertical}
                        onChange={setBannerVertical}
                    />

                    {/* Banner ngang */}
                    <UploadBox
                        label="Banner ngang (16:9)"
                        aspect="16/9"
                        file={bannerHorizontal}
                        onChange={setBannerHorizontal}
                        className="md:col-span-2"
                    />
                </div>
            </section>

            {/* ================= Thông tin cơ bản ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h3 className="font-semibold text-white">
                    * Thông tin cơ bản
                </h3>

                <div>
                    <label className="text-sm text-slate-400">
                        Tên sự kiện
                    </label>
                    <input
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="Hội thảo FA - Tìm kiếm cơ hội..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-slate-400">
                            Hình thức tổ chức
                        </label>
                        <div className="flex gap-6 mt-2 text-white">
                            <label className="flex items-center gap-2">
                                <input type="radio" defaultChecked />
                                Offline
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" />
                                Online (Webinar)
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400">
                            Thể loại
                        </label>
                        <select className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white">
                            <option>Hội thảo & Workshop</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-slate-400">
                        Địa điểm tổ chức
                    </label>
                    <input
                        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                        placeholder="FPT University, Khu CNC Quận 9"
                    />
                </div>
            </section>

            {/* ================= Nội dung sự kiện ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">
                    * Nội dung sự kiện
                </h3>

                <textarea
                    className="w-full min-h-[200px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                    placeholder="Giới thiệu sự kiện..."
                />
            </section>

            {/* ================= Ban tổ chức ================= */}
            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6">
                <h3 className="font-semibold text-white mb-4">
                    Ban tổ chức
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6">
                    {/* Logo */}
                    <UploadBox
                        label="Logo BTC"
                        aspect="1/1"
                        file={orgLogo}
                        onChange={setOrgLogo}
                        square
                    />

                    {/* Info */}
                    <div className="space-y-4">
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                            placeholder="Tên ban tổ chức"
                        />
                        <textarea
                            className="w-full min-h-[120px] rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white"
                            placeholder="Mô tả ban tổ chức"
                        />
                    </div>
                </div>
            </section>

            {/* ================= Actions ================= */}
            <div className="flex justify-between pt-6">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400"
                >
                    Hủy thay đổi
                </button>

                <button
                    onClick={onNext}
                    className="px-6 py-3 rounded-xl bg-primary text-white font-semibold"
                >
                    Tiếp theo →
                </button>
            </div>
        </div>
    );
}

/* ================= Reusable Upload Box ================= */

function UploadBox({
    label,
    aspect,
    file,
    onChange,
    className = "",
    square = false,
}: {
    label: string;
    aspect: string;
    file: File | null;
    onChange: (f: File | null) => void;
    className?: string;
    square?: boolean;
}) {
    return (
        <label
            className={`
                relative cursor-pointer rounded-xl
                border border-dashed border-white/10
                flex items-center justify-center
                text-slate-400 overflow-hidden
                ${square ? "aspect-square" : `aspect-[${aspect}]`}
                ${className}
            `}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                    onChange(e.target.files?.[0] ?? null)
                }
            />

            {file ? (
                <img
                    src={URL.createObjectURL(file)}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <span className="text-sm text-center px-4">
                    {label}
                    <br />
                    <span className="text-xs opacity-60">
                        Click để tải ảnh
                    </span>
                </span>
            )}
        </label>
    );
}
