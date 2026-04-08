import {
    FaCheckCircle,
    FaEye,
    FaCalendar,
} from "react-icons/fa";

interface PostApprovalCardProps {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    date: string;
    status: "pending" | "approved" | "published" | "rejected";
    rejectionReason?: string;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onView?: (id: string) => void;
    onReReview?: (id: string) => void;
}

const statusConfig = {
    pending: {
        label: "Chờ duyệt",
        bgClass: "bg-amber-500/20",
        textClass: "text-amber-500",
        borderClass: "border-amber-500/30",
    },
    approved: {
        label: "Đã duyệt",
        bgClass: "bg-emerald-500/20",
        textClass: "text-emerald-500",
        borderClass: "border-emerald-500/30",
    },
    published: {
        label: "Đã đăng",
        bgClass: "bg-emerald-500/20",
        textClass: "text-emerald-500",
        borderClass: "border-emerald-500/30",
    },
    rejected: {
        label: "Bị từ chối",
        bgClass: "bg-red-500/20",
        textClass: "text-red-500",
        borderClass: "border-red-500/30",
    },
};

export default function StaffPostApprovalCard({
    id,
    title,
    description,
    imageUrl,
    date,
    status,
    rejectionReason,
    onApprove,
    onReject,
    onView,
    onReReview,
}: PostApprovalCardProps) {
    const config = statusConfig[status];

    return (
        <div className="rounded-2xl overflow-hidden flex flex-col group border border-primary/10 bg-[#18122B]/70 backdrop-blur-md hover:border-primary/50 transition-all duration-300">
            {/* Image */}
            <div className="relative h-52 overflow-hidden">
                <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={imageUrl}
                />
                <div className="absolute top-3 right-3">
                    <span
                        className={`px-3 py-1 ${config.bgClass} ${config.textClass} text-[10px] font-black uppercase rounded-full border ${config.borderClass} backdrop-blur-md`}
                    >
                        {config.label}
                    </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0B12] to-transparent p-4">
                    <p className="text-xs text-slate-300 flex items-center gap-1">
                        <FaCalendar className="text-sm" /> {date}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-fuchsia-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Rejection Reason */}
                {status === "rejected" && rejectionReason && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <p className="text-[10px] uppercase font-black text-red-400 mb-1">
                            Lý do từ chối:
                        </p>
                        <p className="text-xs text-red-300/80">{rejectionReason}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-6 border-t border-primary/5 flex items-center gap-2">
                    {status === "pending" && (
                        <>
                            <button
                                onClick={() => onApprove?.(id)}
                                className="flex-[2] bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-500/20"
                            >
                                <FaCheckCircle className="text-sm" /> Duyệt bài
                            </button>
                            <button
                                onClick={() => onReject?.(id)}
                                className="flex-1 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/5 text-slate-300 hover:text-red-400 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                            >
                                Từ chối
                            </button>
                            <button
                                onClick={() => onView?.(id)}
                                className="w-10 h-10 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                            >
                                <FaEye className="text-sm" />
                            </button>
                        </>
                    )}

                    {status === "approved" && (
                        <>
                            <button
                                className="flex-1 border border-slate-700 bg-slate-800/30 text-slate-400 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed opacity-50"
                                disabled
                            >
                                Đã duyệt
                            </button>
                            <button
                                onClick={() => onView?.(id)}
                                className="w-10 h-10 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                            >
                                <FaEye className="text-sm" />
                            </button>
                        </>
                    )}

                    {status === "published" && (
                        <>
                            <button
                                className="flex-1 border border-slate-700 bg-slate-800/30 text-slate-400 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed opacity-50"
                                disabled
                            >
                                Đã duyệt
                            </button>
                            <button
                                onClick={() => onView?.(id)}
                                className="w-10 h-10 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                            >
                                <FaEye className="text-sm" />
                            </button>
                        </>
                    )}

                    {status === "rejected" && (
                        <>
                            <button
                                onClick={() => onReReview?.(id)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                            >
                                Xem lại yêu cầu
                            </button>
                            <button
                                onClick={() => onView?.(id)}
                                className="w-10 h-10 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center transition-all"
                            >
                                <FaEye className="text-sm" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
