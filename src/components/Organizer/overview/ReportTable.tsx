import { FiDownload, FiClock, FiChevronRight, FiChevronLeft } from "react-icons/fi";

interface ReportItem {
    id: string;
    fileName: string;
    createdAt: string;
    createdBy: string;
    status: "success" | "processing";
}

const reports: ReportItem[] = [
    {
        id: "1",
        fileName: "hoi_thao_fa_showing_2026-01-26_17:00_Order_Report.xlsx",
        createdAt: "29 Th01, 2026 - 20:39",
        createdBy: "haomgtest@gmail.com",
        status: "success",
    },
    {
        id: "2",
        fileName: "event_summary_january_2026.xlsx",
        createdAt: "25 Th01, 2026 - 15:20",
        createdBy: "haomgtest@gmail.com",
        status: "success",
    },
    {
        id: "3",
        fileName: "ticket_sales_realtime_data.xlsx",
        createdAt: "30 Th01, 2026 - 09:12",
        createdBy: "admin@aipromo.vn",
        status: "processing",
    },
];

export default function ReportTable() {
    return (
        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0f0b1f] to-[#0b0816] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[40px_2.4fr_1fr_1fr_1fr_80px] px-6 py-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">

                <label className="relative flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                    />
                    <span
                        className="
            w-4 h-4
            rounded-full
            border border-[#5B6B8B]   /* Fiord */
            bg-transparent
            peer-checked:bg-[#5B6B8B]
            peer-checked:border-[#5B6B8B]
            transition
        "
                    />
                </label>
                <div>File</div>
                <div>Ngày tạo</div>
                <div>Người tạo</div>
                <div>Trạng thái xử lý</div>
                <div className="text-center">Thao tác</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
                {reports.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-[40px_2.4fr_1fr_1fr_1fr_80px] px-6 py-5 items-start hover:bg-white/5 transition"
                    >

                        <label className="relative flex items-center cursor-pointer h-full">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                            />
                            <span
                                className="
            w-4 h-4
            rounded-full
            border border-[#5B6B8B]
            bg-transparent
            peer-checked:bg-[#5B6B8B]
            peer-checked:border-[#5B6B8B]
            transition
        "
                            />
                        </label>


                        {/* File */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                XLS
                            </div>
                            <span className="text-sm text-white truncate">
                                {item.fileName}
                            </span>
                        </div>

                        {/* Created at */}
                        <div className="text-sm text-slate-300">
                            {item.createdAt}
                        </div>

                        {/* Created by */}
                        <div className="text-sm text-slate-300">
                            {item.createdBy}
                        </div>

                        {/* Status */}
                        <div>
                            {item.status === "success" ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                    ● Thành công
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-400">
                                    <FiClock size={12} /> Đang xử lý
                                </span>
                            )}
                        </div>

                        {/* Action */}
                        <div className="flex justify-center">
                            {item.status === "success" ? (
                                <button className="text-slate-400 hover:text-primary transition">
                                    <FiDownload />
                                </button>
                            ) : (
                                <span className="text-slate-600">
                                    <FiClock />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 py-4 flex items-center justify-between text-sm text-slate-400">
                {/* Result info */}
                <span>
                    Hiển thị 1 đến 3 trong 3 kết quả
                </span>

                {/* Pagination */}
                <div className="flex items-center gap-2">
                    {/* Prev */}
                    <button
                        className="
                w-8 h-8
                flex items-center justify-center
                rounded-full
                border border-white/10
                text-slate-400
                hover:text-white
                hover:border-primary/40
                transition
            "
                    >
                        <FiChevronLeft size={16} />
                    </button>

                    {/* Current page */}
                    <span
                        className="
                w-8 h-8
                flex items-center justify-center
                rounded-full
                bg-primary
                text-white
                font-medium
            "
                    >
                        1
                    </span>

                    {/* Next */}
                    <button
                        className="
                w-8 h-8
                flex items-center justify-center
                rounded-full
                border border-white/10
                text-slate-400
                hover:text-white
                hover:border-primary/40
                transition
            "
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

        </div>
    );
}
