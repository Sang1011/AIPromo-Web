import { useState } from "react";
import { Outlet } from "react-router-dom";

import { MdDashboard, MdDescription, MdHistory, MdManageAccounts } from "react-icons/md";
import type { DashboardLayoutConfig } from "../../../types/config/dashboard.config";
import Header from "../navigations/Header";
import PromoSidebar from "../navigations/PromoSidebar";
import Sidebar from "../navigations/Sidebar";

const menuGroups = [
    {
        headerGroup: [
            {
                icon: <MdDashboard />,
                label: "Sự kiện của tôi",
                path: "/organizer/my-events",
            },
            {
                icon: <MdHistory />,
                label: "Lịch sử xuất báo cáo",
                path: "/organizer/reports",
            },
            {
                icon: <MdDescription />,
                label: "Điều khoản",
                path: "/organizer/legals",
            },
            {
                icon: <MdManageAccounts />,
                label: "Quản lý tài khoản",
                path: "/organizer/accounts",
            },
        ],
    },
];

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    const [config, setConfig] = useState<DashboardLayoutConfig>({
        title: "",
        havePromoSidebar: false,
    });

    const ifCreateEvent = window.location.pathname === "/organizer/create-event";

    return (
        <div className="min-h-screen flex bg-cinder text-white">
            {ifCreateEvent ? null : (
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    menuGroups={menuGroups}
                />
            )}

            <div
                className={`flex-1 transition-all duration-300 ${ifCreateEvent ? "" : collapsed ? "ml-20" : "ml-64"
                    }`}
            >
                <Header canGoBack={ifCreateEvent} urlBack="/organizer/my-events" title={config.title ?? ""} />

                {config.havePromoSidebar ? (
                    <main className="p-8 flex gap-8">
                        <div className="basis-full xl:basis-[70%]">
                            <Outlet context={{ setConfig }} />
                        </div>

                        <div className="hidden xl:block xl:basis-[30%]">
                            <PromoSidebar />
                        </div>
                    </main>
                ) : (
                    <main className="p-8 flex gap-8">
                        <div className="flex-1">
                            <Outlet context={{ setConfig }} />
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}
