interface StaffPostApprovalPaginationProps {
    currentPage: number;
    totalPages: number;
    startItem: number;
    endItem: number;
    onPageChange: (page: number) => void;
}

export default function StaffPostApprovalPagination({
    currentPage,
    totalPages,
    startItem,
    endItem,
    onPageChange,
}: StaffPostApprovalPaginationProps) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-[#1a1530] border border-primary/10 px-5 py-3">
            <p className="text-slate-400 text-xs">
                Hiển thị{" "}
                <span className="text-white font-semibold">{startItem}</span>{" "}
                trên{" "}
                <span className="text-white font-semibold">{endItem}</span>{" "}
                bài đăng
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md bg-slate-800/80 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                    })
                    .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && page - prev > 1;
                        return (
                            <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                    <span className="text-slate-500 text-xs px-1">
                                        …
                                    </span>
                                )}
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                                        page === currentPage
                                            ? "bg-fuchsia-500 text-white"
                                            : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                                    }`}
                                >
                                    {page}
                                </button>
                            </div>
                        );
                    })}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md bg-slate-800/80 text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
