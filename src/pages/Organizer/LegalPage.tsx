import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FiSlash, FiVolumeX, FiShield } from "react-icons/fi";
import LegalItem from "../../components/Organizer/legal/LegalItem";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

export default function LegalPage() {
    const { setConfig } = useOutletContext<DashboardContext>();

    useEffect(() => {
        setConfig({
            title: "Điều khoản cho Ban Tổ Chức",
        });

        return () => setConfig({});
    }, []);

    return (
        <div className="space-y-6">
            <LegalItem icon={<FiSlash size={18} />} text="1. Danh mục hàng hoá, dịch vụ cấm kinh doanh" />
            <LegalItem icon={<FiVolumeX size={18} />} text="2. Danh mục hàng hoá, dịch vụ cấm quảng cáo" />
            <LegalItem icon={<FiShield size={18} />} text="3. Quy định kiểm duyệt nội dung & hình ảnh" />
        </div>
    );
}
