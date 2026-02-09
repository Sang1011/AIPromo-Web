import OrdersTable from "./OrdersTable";

export default function OrderList() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Danh sách đơn hàng
                        <span className="ml-3 text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                            Đơn hàng
                        </span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition">
                        Xuất báo cáo
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition">
                        Gửi email
                    </button>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-4">
                <input
                    placeholder="Tìm đơn hàng theo mã, tên, email..."
                    className="
                        flex-1
                        px-4 py-2 rounded-xl
                        bg-black/30 border border-white/10
                        text-sm text-white
                        placeholder:text-slate-500
                        outline-none
                    "
                />

                <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition">
                    Bộ lọc
                </button>
            </div>

            <OrdersTable />
        </div>
    );
}
