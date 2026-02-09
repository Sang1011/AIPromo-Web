import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MenuItem } from "../shared/MenuItem";
import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface MenuItemConfig {
    icon: ReactNode;
    label: string;
    path?: string;
}

export interface MenuGroupConfig {
    headerTitle?: string;
    headerGroup: MenuItemConfig[];
}

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    menuGroups: MenuGroupConfig[];
}

export default function Sidebar({
    collapsed,
    setCollapsed,
    menuGroups,
}: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside
            className={`fixed z-50 h-screen flex flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        bg-white dark:bg-gradient-to-b dark:from-[#0B0B12] dark:to-[#18122B]
        border-r border-slate-200 dark:border-slate-800`}
        >
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    A
                </div>
                {!collapsed && (
                    <span className="text-xl font-bold text-primary">
                        AIPromo
                    </span>
                )}
            </div>

            <nav className="px-3 space-y-6 flex-1">
                {menuGroups.map((group, index) => (
                    <div key={index} className="space-y-2">
                        {!collapsed && group.headerTitle && (
                            <div
                                className="
                  px-4
                  text-[10px]
                  font-bold
                  tracking-[0.2em]
                  leading-[15px]
                  text-slate-400
                  uppercase
                "
                            >
                                {group.headerTitle}
                            </div>
                        )}

                        <div className="space-y-1">
                            {group.headerGroup.map((item, idx) => {
                                const isActive =
                                    location.pathname === item.path ||
                                    location.pathname.startsWith(
                                        item.path + "/"
                                    );

                                return (
                                    <MenuItem
                                        key={idx}
                                        icon={item.icon}
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={() => {
                                            navigate(item.path ?? "/organizer/my-events");
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="
            w-full flex items-center justify-center gap-2
            rounded-xl px-3 py-2
            text-slate-400 hover:text-primary
            hover:bg-slate-100 dark:hover:bg-white/5
            transition-all
          "
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    {!collapsed && (
                        <span className="text-sm font-medium">Thu gọn</span>
                    )}
                </button>
            </div>
        </aside>
    );
}
