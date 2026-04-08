import RefundStats from "../../components/Admin/refund/RefundStats";
import RefundTable from "../../components/Admin/refund/RefundTable";

export default function RefundManagementPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                        Quản lý hoàn tiền
                    </h2>
                    <p className="text-slate-400 mt-1">
                        Quản lý và phê duyệt các yêu cầu hoàn tiền từ người dùng hệ thống.
                    </p>
                </div>
            </div>

            <RefundStats />
            <RefundTable />

        </div>
    );
}
