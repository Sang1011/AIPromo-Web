interface Order {
    id: string;
    code: string;
    createdAt: string;
    buyer: string;
    email: string;
    amount: string;
    payment: string;
}

const orders: Order[] = [
    {
        id: "1",
        code: "ORD-9921",
        createdAt: "27/01/2026, 14:30",
        buyer: "Nguyen Van A",
        email: "vana@example.com",
        amount: "500.000đ",
        payment: "MoMo",
    },
    {
        id: "2",
        code: "ORD-9920",
        createdAt: "27/01/2026, 12:15",
        buyer: "Tran Thi B",
        email: "thib@example.com",
        amount: "1.250.000đ",
        payment: "ZaloPay",
    },
    {
        id: "3",
        code: "ORD-9919",
        createdAt: "26/01/2026, 21:05",
        buyer: "Le Van C",
        email: "levanc@example.com",
        amount: "750.000đ",
        payment: "Visa/Master",
    },
];

export default function OrdersTable() {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 overflow-hidden">
            {/* Info */}
            <div className="px-6 py-4 text-sm text-slate-400">
                Có <span className="text-primary">{orders.length}</span> đơn hàng được tìm thấy
            </div>

            {/* Header */}
            <div className="grid grid-cols-[40px_1.2fr_1fr_1.5fr_1fr_1fr_80px] px-6 py-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                <label className="relative flex cursor-pointer">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                    />
                    <span
                        className="
            w-4 h-4
            rounded-full
            border border-[#5B6B8B]
            bg-transparent
            peer-checked:bg-[#5B6B8B]
            peer-checked:border-[#5B6B8B]
            transition
        "
                    />
                </label>
                <div>Mã đơn hàng</div>
                <div>Ngày tạo đơn</div>
                <div>Người mua</div>
                <div>Giá trị đơn</div>
                <div>Thanh toán</div>
                <div className="text-center">Hành động</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {orders.map((o) => (
                    <div
                        key={o.id}
                        className="grid grid-cols-[40px_1.2fr_1fr_1.5fr_1fr_1fr_80px] px-6 py-4 items-center hover:bg-white/5 transition"
                    >
                        <label className="relative flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                            />
                            <span
                                className="
            w-4 h-4
            rounded-full
            border border-[#5B6B8B]   /* Fiord */
            bg-transparent
            peer-checked:bg-[#5B6B8B]
            peer-checked:border-[#5B6B8B]
            transition
        "
                            />
                        </label>

                        {/* Order code */}
                        <span className="text-primary font-medium cursor-pointer">
                            {o.code}
                        </span>

                        <span className="text-sm text-slate-300">
                            {o.createdAt}
                        </span>

                        {/* Buyer */}
                        <div>
                            <p className="text-white text-sm font-medium">
                                {o.buyer}
                            </p>
                            <p className="text-xs text-slate-500">
                                {o.email}
                            </p>
                        </div>

                        <span className="text-white font-semibold">
                            {o.amount}
                        </span>

                        {/* Payment */}
                        <span className="flex items-center gap-2 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {o.payment}
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
