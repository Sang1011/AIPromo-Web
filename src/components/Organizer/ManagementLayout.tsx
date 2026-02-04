import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
    FiPieChart,
    FiBarChart2,
    FiList,
    FiCheckSquare,
    FiUsers,
    FiEdit,
    FiGrid,
    FiTag,
    FiArrowLeft
} from "react-icons/fi";

interface ManagementLayoutProps {
    children: ReactNode;
}

export default function ManagementLayout({ children }: ManagementLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);


    const menuGroups = [
        {
            headerTitle: "Quản trị",
            headerGroup: [
                {
                    icon: <FiArrowLeft />,
                    label: "Quản trị sự kiện",
                    path: "/organizer",
                },
            ],
        },
        {
            headerTitle: "Báo cáo",
            headerGroup: [
                {
                    icon: <FiPieChart />,
                    label: "Tổng kết",
                    path: "/organizer/reports/overview",
                },
                {
                    icon: <FiBarChart2 />,
                    label: "Phân tích",
                    path: "/organizer/reports/analytics",
                },
                {
                    icon: <FiList />,
                    label: "Danh sách đơn hàng",
                    path: "/organizer/orders",
                },
                {
                    icon: <FiCheckSquare />,
                    label: "Check-in",
                    path: "/organizer/check-in",
                },
            ],
        },
        {
            headerTitle: "Cài đặt sự kiện",
            headerGroup: [
                {
                    icon: <FiUsers />,
                    label: "Thành viên",
                    path: "/organizer/members",
                },
                {
                    icon: <FiEdit />,
                    label: "Chỉnh sửa",
                    path: "/organizer/edit",
                },
                {
                    icon: <FiGrid />,
                    label: "Sơ đồ ghế",
                    path: "/organizer/seat-map",
                },
            ],
        },
        {
            headerTitle: "Marketing",
            headerGroup: [
                {
                    icon: <FiTag />,
                    label: "Mã giảm giá (Voucher)",
                    path: "/organizer/vouchers",
                },
            ],
        },
    ];


    return (
        <div className="min-h-screen flex bg-cinder text-white">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} menuGroups={menuGroups} />
            <div
                className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"
                    }`}
            >
                <Header eventName="Hội thảo AI & Future Marketing 2026" eventTime="27 Tháng 01, 2026 - 00:00" />
                <main className="p-8 flex gap-8">
                    <div className="flex-1">{children}</div>
                </main>
            </div>
        </div>
    );
}