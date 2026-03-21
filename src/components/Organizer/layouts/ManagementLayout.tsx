import { useEffect, useState } from "react";
import {
    FiArrowLeft
} from "react-icons/fi";
import { MdAnalytics, MdCampaign, MdConfirmationNumber, MdDashboard, MdEdit, MdEventSeat, MdGroup, MdQrCodeScanner, MdShoppingCart } from "react-icons/md";
import { Outlet, useMatch, useNavigate, useParams } from "react-router-dom";
import Header from "../navigations/Header";
import Sidebar from "../navigations/Sidebar";

export default function ManagementLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    useEffect(() => {
        // fetch eventDetail
    }, [eventId])

    const isMarketingDetail = useMatch(
        "/organizer/my-events/:eventId/marketing/:marketingId"
    );

    const buildEventPath = (sub: string) =>
        `/organizer/my-events/${eventId}/${sub}`;

    const menuGroups = [
        {
            headerTitle: "Quản trị",
            headerGroup: [
                {
                    icon: <FiArrowLeft />,
                    label: "Danh sách sự kiện"
                },
            ],
        },
        {
            headerTitle: "Báo cáo",
            headerGroup: [
                {
                    icon: <MdDashboard />,
                    label: "Tổng kết",
                    path: buildEventPath("overview"),
                },
                {
                    icon: <MdAnalytics />,
                    label: "Phân tích",
                    path: buildEventPath("analytics"),
                },
                {
                    icon: <MdCampaign />,
                    label: "Marketing",
                    path: buildEventPath("marketing"),
                },
                {
                    icon: <MdShoppingCart />,
                    label: "Danh sách đơn hàng",
                    path: buildEventPath("orders"),
                },
                {
                    icon: <MdQrCodeScanner />,
                    label: "Check-in",
                    path: buildEventPath("check-in"),
                },
            ],
        },
        {
            headerTitle: "Cài đặt sự kiện",
            headerGroup: [
                {
                    icon: <MdGroup />,
                    label: "Thành viên",
                    path: buildEventPath("members"),
                },
                {
                    icon: <MdEdit />,
                    label: "Chỉnh sửa",
                    path: buildEventPath("edit"),
                },
                {
                    icon: <MdEventSeat />,
                    label: "Sơ đồ ghế",
                    path: buildEventPath("seat-map"),
                },
            ],
        },
        {
            headerTitle: "Marketing",
            headerGroup: [
                {
                    icon: <MdConfirmationNumber />,
                    label: "Mã giảm giá (Voucher)",
                    path: buildEventPath("vouchers"),
                },
            ],
        },
    ];


    return (
        <div className="min-h-screen flex bg-cinder text-white">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                menuGroups={menuGroups}
            />

            <div
                className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"
                    }`}
            >
                <Header
                    haveTitle={true}
                    canGoBack={!!isMarketingDetail}
                    onBack={() => navigate(buildEventPath("marketing"))}
                />

                <main className="p-8 flex gap-8">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}