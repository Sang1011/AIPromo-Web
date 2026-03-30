import { useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useEventReports } from "../../../hooks/useEventReport";

const PAGE_SIZE = 10;

function SkeletonRow() {
    return (
        <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr] px-6 py-5 items-center gap-4">
            <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="h-4 w-28 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-36 rounded bg-white/5 animate-pulse" />
        </div>
    );
}

export default function ReportTable() {
    const { reports, loading } = useEventReports();
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
    const paginated = reports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0b1f] to-[#0b0816] overflow-hidden">
            <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr] px-6 py-4 text-xs font-semibold tracking-widest text-slate-400 uppercase gap-4">
                <div>Sự kiện</div>
                <div>File</div>
                <div>Ngày tạo</div>
                <div>Người tạo</div>
            </div>

            <div className="divide-y divide-white/5">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-500 text-sm">
                        Chưa có báo cáo nào được tạo
                    </div>
                ) : (
                    paginated.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-[1.5fr_2fr_1fr_1fr] px-6 py-5 items-center gap-4 hover:bg-white/5 transition"
                        >
                            <div className="text-sm text-slate-300 truncate">
                                {item.eventName}
                            </div>

                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                                    XLS
                                </div>
                                <span className="text-sm text-white truncate">
                                    {item.fileName}
                                </span>
                            </div>

                            <div className="text-sm text-slate-300">
                                {formatDate(item.createdAt)}
                            </div>

                            <div className="text-sm text-slate-300 truncate">
                                {item.createdBy}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="px-6 py-4 flex items-center justify-between text-sm text-slate-400">
                <span>
                    Hiển thị{" "}
                    <span className="text-white">
                        {reports.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="text-white">
                        {Math.min(page * PAGE_SIZE, reports.length)}
                    </span>{" "}
                    trong{" "}
                    <span className="text-white">{reports.length}</span> kết quả
                </span>

                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-primary/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <FiChevronLeft size={16} />
                    </button>

                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-medium text-sm">
                        {page}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-primary/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}