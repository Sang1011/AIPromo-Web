import AdminStatsCard from "../shared/AdminStatsCard";
import { MdReceiptLong, MdPendingActions, MdPayments, MdTaskAlt } from "react-icons/md";

export default function RefundStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatsCard
                label="Tổng yêu cầu"
                value="1,284"
                icon={<MdReceiptLong size={20} />}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
                subtext="+12% tháng này"
            />
            <AdminStatsCard
                label="Đang chờ xử lý"
                value="45"
                icon={<MdPendingActions size={20} />}
                iconBg="bg-yellow-500/10"
                iconColor="text-yellow-400"
                subtext="Cần xử lý gấp: 12"
            />
            <AdminStatsCard
                label="Tổng số tiền hoàn"
                value="452.8M"
                icon={<MdPayments size={20} />}
                iconBg="bg-red-500/10"
                iconColor="text-red-400"
                subtext="Cao hơn dự kiến"
                changePositive={false}
            />
            <AdminStatsCard
                label="Tỷ lệ thành công"
                value="94.2%"
                icon={<MdTaskAlt size={20} />}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                subtext="Rất ổn định"
                change="↑ 2.1%"
            />
        </div>
    );
}
