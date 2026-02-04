import { useState } from "react";

type FilterStatus = "upcoming" | "past" | "pending" | "draft";

interface StatusFiltersProps {
    activeFilter?: FilterStatus;
    onFilterChange?: (filter: FilterStatus) => void;
}

const FILTERS: Array<{ key: FilterStatus; label: string }> = [
    { key: "upcoming", label: "Sắp tới" },
    { key: "past", label: "Đã qua" },
    { key: "pending", label: "Chờ duyệt" },
    { key: "draft", label: "Nháp" },
];

export default function StatusFilters({
    activeFilter = "upcoming",
    onFilterChange,
}: StatusFiltersProps) {
    const [active, setActive] = useState<FilterStatus>(activeFilter);

    const handleClick = (filter: FilterStatus) => {
        setActive(filter);
        onFilterChange?.(filter);
    };

    return (
        <div
            className="
            flex bg-white dark:bg-card-dark
            p-1.5 rounded-2xl
            border border-slate-200 dark:border-slate-800
        "
        >
            {FILTERS.map((filter) => (
                <button
                    key={filter.key}
                    onClick={() => handleClick(filter.key)}
                    className={`
                        px-6 py-2 rounded-xl font-medium
                        transition-all
                        ${active === filter.key
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary"
                        }
                    `}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

export type { FilterStatus };