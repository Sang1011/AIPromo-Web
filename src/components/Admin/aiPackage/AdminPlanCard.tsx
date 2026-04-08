import { MdDeleteOutline, MdDescription, MdEdit, MdToken, MdVisibility } from "react-icons/md";
import type { AIPackage } from "../../../types/aiPackage/aiPackage";

interface AdminPlanCardProps {
    pkg: AIPackage;
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (pkg: { id: string; name: string }) => void;
    onToggle: (pkg: { id: string; name: string; isActive: boolean }) => void;
}

export default function AdminPlanCard({
    pkg,
    onView,
    onEdit,
    onDelete,
    onToggle,
}: AdminPlanCardProps) {
    const isSubscription = pkg.type === "Subscription";
    const formattedPrice = pkg.price
        ? new Intl.NumberFormat("vi-VN").format(pkg.price)
        : "0";

    const formattedToken = pkg.tokenQuota
        ? new Intl.NumberFormat("vi-VN").format(pkg.tokenQuota)
        : "0";

    return (
        <div className="glass-card rounded-2xl flex flex-col transition-all duration-300 hover:border-violet-500/40 relative overflow-hidden group">
            {/* Top accent bar */}
            <div
                className={`h-1 ${isSubscription
                    ? "bg-gradient-to-r from-violet-600 to-violet-400"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                    }`}
            />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{pkg.name}</h3>

                    <div className="flex items-baseline gap-1.5 mt-2">
                        <span
                            className={`text-2xl font-black ${isSubscription ? "text-violet-400" : "text-amber-400"
                                }`}
                        >
                            {formattedPrice}
                        </span>
                        <span className="text-sm text-slate-500">
                            {isSubscription ? "VND/tháng" : "VND/gói"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isSubscription
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                    >
                        {isSubscription ? "Subscription" : "TopUp"}
                    </span>

                    {/* Toggle */}
                    <button
                        onClick={() =>
                            onToggle({
                                id: pkg.id,
                                name: pkg.name,
                                isActive: pkg.isActive,
                            })
                        }
                        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${pkg.isActive
                            ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                            : "bg-slate-700"
                            }`}
                    >
                        <span
                            className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform duration-300 shadow-md ${pkg.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 pb-4">
                <div className="flex items-start gap-2.5">
                    <MdDescription className="text-slate-600 text-sm mt-0.5 shrink-0" />
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                        {pkg.description || "Không có mô tả"}
                    </p>
                </div>
            </div>

            {/* Token quota */}
            <div className="px-6 pb-4">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSubscription ? "bg-violet-500/10" : "bg-amber-500/10"
                            }`}
                    >
                        <MdToken
                            className={`text-base ${isSubscription ? "text-violet-400" : "text-amber-400"
                                }`}
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                            {isSubscription ? "Giới hạn AI" : "Token nạp thêm"}
                        </p>
                        <p className="text-sm font-bold text-white">
                            {formattedToken}{" "}
                            <span className="text-slate-500 font-normal text-xs">
                                {isSubscription ? "nội dung/tháng" : "tokens/gói"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Extra info badge */}
            <div className="px-6 pb-4">
                <div
                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium border ${isSubscription
                        ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        }`}
                >
                    {isSubscription
                        ? "Gia hạn và reset quota theo chu kỳ tháng"
                        : "Mua 1 lần để cộng thêm token sử dụng"}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto px-6 py-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(pkg.id)}
                        aria-label="view"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/10 hover:border-blue-500/30"
                    >
                        <MdVisibility className="text-lg" />
                    </button>

                    <button
                        onClick={() => onEdit(pkg.id)}
                        aria-label="edit"
                        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all border border-violet-500/10 hover:border-violet-500/30 font-semibold text-sm"
                    >
                        <MdEdit className="text-base" />
                        <span>Edit</span>
                    </button>

                    <button
                        onClick={() => onDelete({ id: pkg.id, name: pkg.name })}
                        aria-label="delete"
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/10 hover:border-red-500/30"
                    >
                        <MdDeleteOutline className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}