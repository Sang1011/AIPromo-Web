import { useState, type ReactNode } from "react";
import {
    FiCalendar,
    FiBarChart2,
    FiFileText,
} from "react-icons/fi";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PromoSidebar from "./PromoSidebar";

const menuGroups = [
    {
        headerGroup: [
            {
                icon: <FiCalendar />,
                label: "Sự kiện của tôi",
                path: "/organizer/events",
            },
            {
                icon: <FiBarChart2 />,
                label: "Quản lý báo cáo",
                path: "/organizer/reports",
            },
            {
                icon: <FiFileText />,
                label: "Điều khoản",
                path: "/legal",
            },
        ],
    },
];

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    havePromoSidebar?: boolean;
}

export default function DashboardLayout({
    children,
    title,
    havePromoSidebar = false,
}: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

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
                <Header title={title} />

                {havePromoSidebar ? (
                    <main className="p-8 flex gap-8">
                        <div className="basis-full xl:basis-[70%]">
                            {children}
                        </div>

                        <div className="hidden xl:block xl:basis-[30%]">
                            <PromoSidebar />
                        </div>
                    </main>
                ) : (
                    <main className="p-8 flex gap-8">
                        <div className="flex-1">{children}</div>
                    </main>
                )}
            </div>
        </div>
    );
}
