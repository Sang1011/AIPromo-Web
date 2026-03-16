import StaffEventApprovalStats from "../../components/Staff/events/StaffEventApprovalStats";
import StaffEventApprovalQueue from "../../components/Staff/events/StaffEventApprovalQueue";

export default function EventApprovalPage() {
    return (
        <div className="space-y-10">
            <div className="mb-10">
                <h3 className="text-4xl font-extrabold tracking-tight text-white mb-3">
                    Danh sách chờ duyệt sự kiện
                </h3>
                <p className="text-slate-400 text-lg font-medium max-w-3xl leading-relaxed">
                    Bảng điều khiển kiểm duyệt toàn hệ thống cho các đăng ký sự
                    kiện và đề xuất hợp tác mới.
                </p>
            </div>
            <StaffEventApprovalStats />
            <StaffEventApprovalQueue />
        </div>
    );
}
