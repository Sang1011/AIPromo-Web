interface DropdownItemProps {
    onClick?: (e: React.MouseEvent) => void;
    isSelected?: boolean;
    children: React.ReactNode;
    suffix?: React.ReactNode;
}
export function DropdownItem({ onClick, isSelected, children, suffix }: DropdownItemProps) {
    return (
        <div
            onMouseDown={onClick}
            className={`
                flex items-center justify-between px-4 py-2.5
                text-sm border-b border-white/5 last:border-b-0
                cursor-pointer select-none transition-colors
                ${isSelected
                    ? "bg-primary/15 text-primary"
                    : "text-white hover:bg-white/8"
                }
            `}
        >
            <span className="truncate">{children}</span>
            {suffix && <span className="ml-3 flex-shrink-0 text-xs text-slate-400">{suffix}</span>}
        </div>
    );
}

export function DropdownLoading() {
    return (
        <div className="px-4 py-4 text-sm text-slate-500 text-center animate-pulse">
            Đang tải...
        </div>
    );
}