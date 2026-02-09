import { useState } from "react";
import {
    FiArrowLeft,
    FiBarChart2,
    FiCheckSquare,
    FiEdit,
    FiGrid,
    FiList,
    FiPieChart,
    FiTag,
    FiUsers
} from "react-icons/fi";
import { Outlet, useParams } from "react-router-dom";
import Header from "../navigations/Header";
import Sidebar from "../navigations/Sidebar";

export default function ManagementLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { eventId } = useParams<{ eventId: string }>();
    const buildEventPath = (sub: string) =>
        `/organizer/my-events/${eventId}/${sub}`;

    const menuGroups = [
        {
            headerTitle: "Quản trị",
            headerGroup: [
                {
                    icon: <FiArrowLeft />,
                    label: "Quản trị sự kiện"
                },
            ],
        },
        {
            headerTitle: "Báo cáo",
            headerGroup: [
                {
                    icon: <FiPieChart />,
                    label: "Tổng kết",
                    path: buildEventPath("overview"),
                },
                {
                    icon: <FiBarChart2 />,
                    label: "Phân tích",
                    path: buildEventPath("analytics"),
                },
                {
                    icon: <FiList />,
                    label: "Danh sách đơn hàng",
                    path: buildEventPath("orders"),
                },
                {
                    icon: <FiCheckSquare />,
                    label: "Check-in",
                    path: buildEventPath("check-in"),
                },
            ],
        },
        {
            headerTitle: "Cài đặt sự kiện",
            headerGroup: [
                {
                    icon: <FiUsers />,
                    label: "Thành viên",
                    path: buildEventPath("members"),
                },
                {
                    icon: <FiEdit />,
                    label: "Chỉnh sửa",
                    path: buildEventPath("edit"),
                },
                {
                    icon: <FiGrid />,
                    label: "Sơ đồ ghế",
                    path: buildEventPath("seat-map"),
                },
            ],
        },
        {
            headerTitle: "Marketing",
            headerGroup: [
                {
                    icon: <FiTag />,
                    label: "Mã giảm giá (Voucher)",
                    path: buildEventPath("vouchers"),
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
                    <div className="flex-1"><Outlet /></div>
                </main>
            </div>
        </div>
    );
}