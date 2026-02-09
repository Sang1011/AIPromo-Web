import { FiEye, FiUsers, FiShoppingBag, FiPercent } from "react-icons/fi";

const cards = [
    {
        label: "Số lượt truy cập",
        value: "5.2k",
        change: "+12.5%",
        up: true,
        icon: <FiEye />,
    },
    {
        label: "Người dùng",
        value: "2.1k",
        change: "+8.2%",
        up: true,
        icon: <FiUsers />,
    },
    {
        label: "Người mua",
        value: "450",
        change: "+5.4%",
        up: true,
        icon: <FiShoppingBag />,
    },
    {
        label: "Tỉ lệ chuyển đổi",
        value: "8.5%",
        change: "-1.2%",
        up: false,
        icon: <FiPercent />,
    },
];

export default function AnalyticsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((c) => (
                <div
                    key={c.label}
                    className="rounded-2xl bg-gradient-to-br from-[#1a1230] to-[#0d0a1c] border border-white/5 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-400">{c.label}</p>
                        <div className="text-primary">{c.icon}</div>
                    </div>

                    <p className="text-3xl font-bold text-white mb-1">
                        {c.value}
                    </p>

                    <p
                        className={`text-sm ${c.up ? "text-emerald-400" : "text-red-400"
                            }`}
                    >
                        {c.change} so với tháng trước
                    </p>
                </div>
            ))}
        </div>
    );
}
