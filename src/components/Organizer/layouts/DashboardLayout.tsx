import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
    FiCalendar,
    FiBarChart2,
    FiFileText,
} from "react-icons/fi";

import Sidebar from "../navigations/Sidebar";
import Header from "../navigations/Header";
import PromoSidebar from "../navigations/PromoSidebar";
import type { DashboardLayoutConfig } from "../../../types/organizer/dashboard.config";

const menuGroups = [
    {
        headerGroup: [
            {
                icon: <FiCalendar />,
                label: "Sự kiện của tôi",
                path: "/organizer/my-events",
            },
            {
                icon: <FiBarChart2 />,
                label: "Quản lý báo cáo",
                path: "/organizer/reports",
            },
            {
                icon: <FiFileText />,
                label: "Điều khoản",
                path: "/organizer/legals",
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
                <Header title={config.title ?? ""} />

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
