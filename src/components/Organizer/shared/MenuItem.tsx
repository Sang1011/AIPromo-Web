import { type ReactNode } from "react";

interface MenuItemProps {
    icon: ReactNode;
    label: string;
    active?: boolean;
    collapsed: boolean;
}

interface MenuItemProps {
    icon: ReactNode;
    label: string;
    active?: boolean;
    collapsed: boolean;
    onClick?: () => void;
}

export function MenuItem({
    icon,
    label,
    active = false,
    collapsed,
    onClick,
}: MenuItemProps) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
        ${active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10 hover:text-primary"
                }`}
        >
            <span className="text-xl shrink-0">{icon}</span>
            {!collapsed && <span className="font-medium">{label}</span>}
        </div>
    );
}
