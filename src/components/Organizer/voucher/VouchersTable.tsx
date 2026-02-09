interface Voucher {
    id: string;
    code: string;
    campaign: string;
    expireAt: string;
    discount: string;
    quantity: number;
    used: number;
    status: "running" | "expired" | "ended";
}

const vouchers: Voucher[] = [
    {
        id: "1",
        code: "SUMMER2026",
        campaign: "Ưu đãi mùa hè",
        expireAt: "30/06/2026",
        discount: "20%",
        quantity: 100,
        used: 45,
        status: "running",
    },
    {
        id: "2",
        code: "AIEXPO50",
        campaign: "Khuyến mãi triển lãm",
        expireAt: "15/02/2026",
        discount: "50.000đ",
        quantity: 200,
        used: 188,
        status: "ended",
    },
];

const statusLabel: Record<Voucher["status"], string> = {
    running: "Đang chạy",
    expired: "Hết hạn",
    ended: "Sắp hết",
};

const statusStyle: Record<Voucher["status"], string> = {
    running: "bg-emerald-500/20 text-emerald-400",
    expired: "bg-red-500/20 text-red-400",
    ended: "bg-amber-500/20 text-amber-400",
};

export default function VouchersTable() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
            {/* Info */}
            <div className="px-6 py-4 text-sm text-slate-400">
                Đang hiển thị{" "}
                <span className="text-primary">
                    {vouchers.length}
                </span>{" "}
                mã giảm giá
            </div>

            {/* Header */}
            <div className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_1.2fr_80px] px-6 py-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                <div>Mã voucher</div>
                <div>Chương trình</div>
                <div>Giảm giá</div>
                <div>Số lượng</div>
                <div>Đã dùng</div>
                <div>Trạng thái</div>
                <div className="text-center">Thao tác</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {vouchers.map((v) => (
                    <div
                        key={v.id}
                        className="grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr_1.2fr_80px] px-6 py-4 items-center hover:bg-white/5 transition"
                    >
                        {/* Code */}
                        <span className="text-primary font-medium cursor-pointer">
                            {v.code}
                        </span>

                        {/* Campaign */}
                        <div>
                            <p className="text-white text-sm font-medium">
                                {v.campaign}
                            </p>
                            <p className="text-xs text-slate-500">
                                Hết hạn: {v.expireAt}
                            </p>
                        </div>

                        {/* Discount */}
                        <span className="text-white font-semibold">
                            {v.discount}
                        </span>

                        {/* Quantity */}
                        <span className="text-slate-300">
                            {v.quantity}
                        </span>

                        {/* Used */}
                        <span className="text-slate-300">
                            {v.used}
                        </span>

                        {/* Status */}
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${statusStyle[v.status]}`}
                        >
                            {statusLabel[v.status]}
                        </span>

                        {/* Action */}
                        <div className="flex justify-center">
                            <button className="text-slate-400 hover:text-white transition">
                                •••
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
