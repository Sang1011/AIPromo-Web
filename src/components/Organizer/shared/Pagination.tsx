import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export default function Pagination({
    currentPage = 1,
    totalPages = 3,
    onPageChange,
}: PaginationProps) {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange?.(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange?.(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange?.(page);
    };

    return (
        <div className="flex justify-center items-center gap-2 py-8">
            {/* Previous button */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="
                    w-10 h-10 flex items-center justify-center
                    rounded-xl
                    bg-white dark:bg-card-dark
                    border border-slate-200 dark:border-slate-800
                    text-slate-400
                    hover:text-primary
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                "
            >
                <FiChevronLeft />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`
                        w-10 h-10 flex items-center justify-center
                        rounded-xl font-bold
                        transition-all
                        ${page === currentPage
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary"
                        }
                    `}
                >
                    {page}
                </button>
            ))}

            {/* Next button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="
                    w-10 h-10 flex items-center justify-center
                    rounded-xl
                    bg-white dark:bg-card-dark
                    border border-slate-200 dark:border-slate-800
                    text-slate-400
                    hover:text-primary
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all
                "
            >
                <FiChevronRight />
            </button>
        </div>
    );
}