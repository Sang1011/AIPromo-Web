import DashboardLayout from "../../components/Organizer/DashboardLayout";
import { FiSlash, FiVolumeX, FiShield } from "react-icons/fi";
import LegalItem from "../../components/Organizer/LegalItem";

export default function Legal() {
    return (
        <DashboardLayout title="Điều khoản cho Ban Tổ Chức">
            <div className="space-y-6">
                <LegalItem
                    icon={<FiSlash size={18} />}
                    text="1. Danh mục hàng hoá, dịch vụ cấm kinh doanh"
                />

                <LegalItem
                    icon={<FiVolumeX size={18} />}
                    text="2. Danh mục hàng hoá, dịch vụ cấm quảng cáo"
                />

                <LegalItem
                    icon={<FiShield size={18} />}
                    text="3. Quy định kiểm duyệt nội dung & hình ảnh"
                />
            </div>
        </DashboardLayout>
    );
}
