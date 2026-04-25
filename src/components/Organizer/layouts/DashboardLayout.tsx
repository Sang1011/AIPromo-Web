import { useState } from "react";
import { Outlet } from "react-router-dom";

import { MdDashboard, MdDescription, MdEventNote, MdHistory, MdManageAccounts } from "react-icons/md";
import type { DashboardLayoutConfig } from "../../../types/config/dashboard.config";
import Header from "../navigations/Header";
import PromoSidebar from "../navigations/PromoSidebar";
import Sidebar from "../navigations/Sidebar";

const menuGroups = [
    {
        headerGroup: [
            {
                icon: <MdDashboard />,
                label: "Tổng quan",
                path: "/organizer/overall",
            },
            {
                icon: <MdEventNote />,
                label: "Danh sách sự kiện",
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
                style={{
                    marginLeft: ifCreateEvent ? 0 : collapsed ? 80 : 256,
                    width: ifCreateEvent ? "100%" : collapsed ? "calc(100% - 80px)" : "calc(100% - 256px)",
                }}
                className="transition-all duration-300"
            >
                <Header canGoBack={ifCreateEvent} urlBack="/organizer/my-events" title={config.title ?? ""} />

                {config.havePromoSidebar ? (
                    <main className="p-8 flex gap-8 items-start">
                        <div className="flex-1 min-w-0">
                            <Outlet context={{ setConfig }} />
                        </div>

                        <div className="hidden xl:block w-64 flex-shrink-0">
                            <PromoSidebar />
                        </div>
                    </main>
                ) : (
                    <main className="p-8 overflow-hidden">
                        <div className="min-w-0 overflow-hidden">
                            <Outlet context={{ setConfig }} />
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}
