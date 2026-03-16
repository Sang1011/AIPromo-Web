import { MdError, MdWarning, MdAnalytics } from "react-icons/md";

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export default function AdminLogsSummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
                className={`${glassCard} rounded-xl p-4 flex items-center gap-4`}
            >
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <MdError size={24} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-[#a592c8] tracking-widest">
                        Lỗi đang hoạt động
                    </p>
                    <p className="text-xl font-bold text-white">04</p>
                </div>
            </div>
            <div
                className={`${glassCard} rounded-xl p-4 flex items-center gap-4`}
            >
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <MdWarning size={24} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-[#a592c8] tracking-widest">
                        Cảnh báo (24h)
                    </p>
                    <p className="text-xl font-bold text-white">12</p>
                </div>
            </div>
            <div
                className={`${glassCard} rounded-xl p-4 flex items-center gap-4`}
            >
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <MdAnalytics size={24} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-[#a592c8] tracking-widest">
                        Tổng Hoạt động
                    </p>
                    <p className="text-xl font-bold text-white">12,840</p>
                </div>
            </div>
        </div>
    );
}
