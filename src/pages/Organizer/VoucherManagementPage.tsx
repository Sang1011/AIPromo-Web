import ManagementLayout from "../../components/Organizer/ManagementLayout";
import VouchersTable from "../../components/Organizer/VouchersTable";

export default function VoucherManagementPage() {
    return (
        <ManagementLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Quản lý mã giảm giá
                            <span className="ml-3 text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                                Hoạt động
                            </span>
                        </h1>
                    </div>

                    <button
                        className="
                        bg-primary hover:bg-primary/90
                        text-white px-5 py-2.5 rounded-full
                        font-semibold flex items-center gap-2
                        shadow-lg shadow-primary/30
                    "
                    >
                        + Tạo Voucher mới
                    </button>
                </div>

                {/* Search + Filter */}
                <div className="flex items-center gap-4">
                    <input
                        placeholder="Tìm kiếm voucher theo mã hoặc chương trình..."
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

                <VouchersTable />
            </div>
        </ManagementLayout>
    );
}
