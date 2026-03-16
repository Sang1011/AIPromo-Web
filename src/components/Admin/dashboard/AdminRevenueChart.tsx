const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";
const neonGlow = "shadow-[0_0_15px_rgba(124,59,237,0.4)]";

export default function AdminRevenueChart() {
    return (
        <div
            className={`lg:col-span-2 ${glassCard} rounded-xl p-8 ${neonGlow}`}
        >
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Xu hướng Doanh thu & Giao dịch
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Số liệu hiệu suất hàng ngày trong 30 ngày gần nhất
                    </p>
                </div>
                <select className="bg-[#302447] border-none text-white text-xs rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary">
                    <option>Tháng này</option>
                    <option>Tháng trước</option>
                </select>
            </div>
            <div className="h-64 relative w-full">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 200"
                >
                    <defs>
                        <linearGradient
                            id="adminGradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#7c3bed"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="100%"
                                stopColor="#7c3bed"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,180 Q100,160 200,100 T400,120 T600,60 T800,40 V200 H0 Z"
                        fill="url(#adminGradient)"
                    />
                    <path
                        d="M0,180 Q100,160 200,100 T400,120 T600,60 T800,40"
                        fill="none"
                        stroke="#7c3bed"
                        strokeLinecap="round"
                        strokeWidth={3}
                    />
                    <circle
                        className={neonGlow}
                        cx={200}
                        cy={100}
                        fill="#7c3bed"
                        r={5}
                    />
                    <circle
                        className={neonGlow}
                        cx={600}
                        cy={60}
                        fill="#7c3bed"
                        r={5}
                    />
                </svg>
                <div className="flex justify-between mt-4 text-[10px] text-[#a592c8] font-bold">
                    <span>W1</span>
                    <span>W2</span>
                    <span>W3</span>
                    <span>W4</span>
                </div>
            </div>
        </div>
    );
}
