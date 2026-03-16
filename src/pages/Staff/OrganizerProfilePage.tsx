import StaffOrganizerStats from "../../components/Staff/organizers/StaffOrganizerStats";
import StaffOrganizerProfileList from "../../components/Staff/organizers/StaffOrganizerProfileList";

export default function OrganizerProfilePage() {
    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h3 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                    DUYỆT HỒ SƠ NHÀ TỔ CHỨC
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                    Quản lý và xác minh thông tin danh tính của các đơn vị tổ chức
                    sự kiện mới tham gia hệ thống.
                </p>
            </div>
            <StaffOrganizerStats />
            <StaffOrganizerProfileList />
        </div>
    );
}
