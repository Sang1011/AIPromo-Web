const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";
const neonGlow = "shadow-[0_0_15px_rgba(124,59,237,0.4)]";

export default function AdminUserDistribution() {
    return (
        <div className={`${glassCard} rounded-xl p-8`}>
            <h2 className="text-lg font-bold text-white mb-2">
                Phân bổ Người dùng
            </h2>
            <p className="text-[#a592c8] text-sm mb-10">
                Tỷ lệ Người tổ chức so với Người tham dự
            </p>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={96}
                        cy={96}
                        fill="transparent"
                        r={80}
                        stroke="#302447"
                        strokeWidth={20}
                    />
                    <circle
                        className={neonGlow}
                        cx={96}
                        cy={96}
                        fill="transparent"
                        r={80}
                        stroke="#7c3bed"
                        strokeDasharray="351, 502"
                        strokeWidth={20}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">70%</span>
                    <span className="text-[10px] text-[#a592c8] uppercase font-bold tracking-widest">
                        Tăng trưởng
                    </span>
                </div>
            </div>
            <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-sm text-white">Attendees</span>
                    </div>
                    <span className="text-sm font-bold text-white">8,112</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#302447]" />
                        <span className="text-sm text-white">Organizers</span>
                    </div>
                    <span className="text-sm font-bold text-white">4,368</span>
                </div>
            </div>
        </div>
    );
}
