import { MdAdsClick, MdInsights, MdPayments, MdPercent, MdShoppingBag, MdVisibility } from "react-icons/md";

export default function KPISummary() {
    return (
        <section className="space-y-4">
            {/* Mô tả */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-semibold">
                    Số liệu tổng hợp từ tất cả nền tảng (Facebook, Instagram, AIPromo).
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { icon: <MdVisibility />, label: "Lượt hiển thị", value: "45.2K", note: "+12% so với hôm qua" },
                    { icon: <MdAdsClick />, label: "Lượt nhấp", value: "2.840", note: "+5.4% so với hôm qua" },
                    { icon: <MdShoppingBag />, label: "Chuyển đổi", value: "186", note: "+2.1% so với hôm qua" },
                    { icon: <MdPercent />, label: "CTR (%)", value: "6.28%", note: "Trung bình ngành: 4.5%" },
                    { icon: <MdInsights />, label: "Tỉ lệ CĐ (%)", value: "6.55%", note: "+0.8% mục tiêu" },
                    { icon: <MdPayments />, label: "Doanh thu", value: "92.5M", note: "VNĐ" },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="glass p-5 rounded-3xl neon-glow-purple border-l-4 border-l-primary"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-primary text-2xl">
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-white">
                            {item.value}
                        </h3>
                        <p className="text-[10px] text-primary mt-1 font-bold">
                            {item.note}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}