import { FileText } from "lucide-react";

export interface SubscriptionHistoryItem {
    id: string;
    transactionCode: string;
    planName: string;
    planTier: "free" | "pro" | "business";
    periodStart: string;
    periodEnd: string;
    amount: number;
    purchasedAt: string;
    status: "success" | "expired" | "pending" | "failed";
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_HISTORY: SubscriptionHistoryItem[] = [
    {
        id: "1",
        transactionCode: "SUB-20250415",
        planName: "Pro",
        planTier: "pro",
        periodStart: "15/04/2025",
        periodEnd: "15/07/2025",
        amount: 399000,
        purchasedAt: "15/04/2025",
        status: "success",
    },
    {
        id: "2",
        transactionCode: "SUB-20250115",
        planName: "Pro",
        planTier: "pro",
        periodStart: "15/01/2025",
        periodEnd: "15/04/2025",
        amount: 399000,
        purchasedAt: "15/01/2025",
        status: "expired",
    },
    {
        id: "3",
        transactionCode: "SUB-20241015",
        planName: "Free",
        planTier: "free",
        periodStart: "15/10/2024",
        periodEnd: "15/01/2025",
        amount: 0,
        purchasedAt: "15/10/2024",
        status: "expired",
    },
    {
        id: "4",
        transactionCode: "SUB-20250716",
        planName: "Business",
        planTier: "business",
        periodStart: "16/07/2025",
        periodEnd: "16/08/2025",
        amount: 999000,
        purchasedAt: "—",
        status: "pending",
    },
];
// ──────────────────────────────────────────────────────────────────────────────

const planTierStyle: Record<string, string> = {
    free: "text-slate-400",
    pro: "text-amber-400",
    business: "text-purple-400",
};

const statusConfig: Record<
    string,
    { label: string; className: string }
> = {
    success: {
        label: "Thành công",
        className:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-400/25",
    },
    expired: {
        label: "Đã hết hạn",
        className: "bg-white/5 text-slate-500 border border-white/10",
    },
    pending: {
        label: "Chờ xử lý",
        className:
            "bg-amber-500/10 text-amber-400 border border-amber-400/25",
    },
    failed: {
        label: "Thất bại",
        className: "bg-red-500/10 text-red-400 border border-red-400/25",
    },
};

interface Props {
    /** pass real data when API is ready; defaults to mock */
    data?: SubscriptionHistoryItem[];
}

export default function SubscriptionHistoryTable({ data = MOCK_HISTORY }: Props) {
    return (
        <div className="rounded-2xl border border-white/8 overflow-hidden bg-[#18122B]">
            {/* table header label */}
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Lịch sử thanh toán</p>
                <span className="text-xs text-slate-500">{data.length} giao dịch</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/6">
                            {["Mã giao dịch", "Gói", "Kỳ hạn", "Số tiền", "Ngày mua", "Trạng thái", ""].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => {
                            const status = statusConfig[row.status];
                            return (
                                <tr
                                    key={row.id}
                                    className="border-b border-white/4 hover:bg-white/[0.025] transition-colors last:border-b-0"
                                >
                                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                                        #{row.transactionCode}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`text-sm font-semibold ${planTierStyle[row.planTier]}`}
                                        >
                                            {row.planName}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                                        {row.periodStart} – {row.periodEnd}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm font-semibold text-white whitespace-nowrap">
                                        {row.amount === 0
                                            ? "Miễn phí"
                                            : row.amount.toLocaleString("vi-VN") + " ₫"}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-slate-500">
                                        {row.purchasedAt}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.className}`}
                                        >
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {row.status === "success" || row.status === "expired" ? (
                                            <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition">
                                                <FileText size={12} />
                                                Hoá đơn
                                            </button>
                                        ) : (
                                            <span className="text-slate-700 text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}