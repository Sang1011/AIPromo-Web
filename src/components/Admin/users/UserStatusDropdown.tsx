import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export type UserStatus = "Active" | "Inactive" | "Banned";

interface UserStatusDropdownProps {
    currentStatus: UserStatus;
    onStatusSelect: (newStatus: UserStatus) => void;
    disabled?: boolean;
}

const statusConfig = {
    Active: {
        label: "Hoạt động",
        color: "bg-emerald-500/10 text-emerald-400",
        dotColor: "bg-emerald-400",
    },
    Inactive: {
        label: "Không hoạt động",
        color: "bg-gray-500/10 text-gray-400",
        dotColor: "bg-gray-400",
    },
    Banned: {
        label: "Bị cấm",
        color: "bg-red-500/10 text-red-400",
        dotColor: "bg-red-400",
    },
};

export default function UserStatusDropdown({
    currentStatus,
    onStatusSelect,
    disabled = false,
}: UserStatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; right: number; openUpward: boolean } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside or scrolling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    // Calculate position for portal rendering
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const dropdownHeight = 120; // Reduced height
            const spaceBelow = viewportHeight - rect.bottom;
            const openUpward = spaceBelow < dropdownHeight;

            setPosition({
                top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
                right: window.innerWidth - rect.right,
                openUpward,
            });
        } else if (!isOpen) {
            setPosition(null);
        }
    }, [isOpen]);

    const handleStatusClick = (status: UserStatus) => {
        if (status !== currentStatus) {
            onStatusSelect(status);
        }
        setIsOpen(false);
    };

    const availableStatuses = (Object.keys(statusConfig) as UserStatus[]).filter(
        (status) => status !== currentStatus
    );

    const currentConfig = statusConfig[currentStatus];

    const dropdownContent = isOpen && position && (
        <div
            className="fixed py-1 min-w-[160px] z-[10000]"
            style={{
                top: `${position.top}px`,
                right: `${position.right}px`,
            }}
        >
            <div
                className="bg-[rgba(30,22,56,0.98)] backdrop-blur-xl border border-[rgba(124,59,237,0.3)] rounded-lg shadow-2xl animate-in fade-in duration-200"
            >
                <div className="px-2.5 py-1.5 border-b border-[rgba(124,59,237,0.2)]">
                    <p className="text-[9px] text-[#a592c8] font-semibold uppercase tracking-wider">
                        Chọn trạng thái
                    </p>
                </div>
                <div className="py-0.5">
                    {availableStatuses.map((status) => {
                        const config = statusConfig[status];
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusClick(status)}
                                className="w-full px-3 py-2 text-left text-xs hover:bg-[rgba(124,59,237,0.1)] transition-all duration-150 flex items-center gap-2.5"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                                <span className="text-white font-medium">{config.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div ref={containerRef} className="relative inline-block">
                {/* Status Badge Button */}
                <button
                    ref={buttonRef}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                        transition-all duration-200 cursor-pointer
                        ${currentConfig.color}
                        ${!disabled ? "hover:scale-105 hover:shadow-lg" : "opacity-50 cursor-not-allowed"}
                    `}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dotColor}`} />
                    <span>{currentConfig.label}</span>
                </button>
            </div>

            {/* Render dropdown using Portal to escape overflow constraints */}
            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    );
}
