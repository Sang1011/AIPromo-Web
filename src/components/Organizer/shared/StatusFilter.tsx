type FilterStatus = "Upcoming" | "Past" | "Pending" | "Draft";

interface StatusFiltersProps {
    activeFilter?: FilterStatus;
    onFilterChange?: (filter: FilterStatus) => void;
}

const FILTERS: Array<{ key: FilterStatus; label: string }> = [
    { key: "Upcoming", label: "Đang diễn ra" },
    { key: "Past", label: "Đã qua" },
    { key: "Pending", label: "Chờ duyệt" },
    { key: "Draft", label: "Nháp" },
];

export default function StatusFilters({
    activeFilter = "Draft",
    onFilterChange,
}: StatusFiltersProps) {

    const handleClick = (filter: FilterStatus) => {
        onFilterChange?.(filter);
    };

    return (
        <div className="flex bg-white dark:bg-card-dark p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {FILTERS.map((filter) => (
                <button
                    key={filter.key}
                    onClick={() => handleClick(filter.key)}
                    className={`
                        px-6 py-2 rounded-xl font-medium transition-all
                        ${activeFilter === filter.key
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