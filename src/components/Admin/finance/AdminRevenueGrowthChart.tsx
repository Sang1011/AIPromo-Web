const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.2)]";

export default function AdminRevenueGrowthChart() {
    return (
        <div className={`${glassCard} rounded-xl p-8`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Tăng trưởng Doanh thu
                    </h2>
                    <p className="text-[#a592c8] text-sm">
                        Theo dõi hiệu suất doanh số và phí nền tảng
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-primary" />
                            <span className="text-xs text-[#a592c8]">
                                Net Revenue
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-400" />
                            <span className="text-xs text-[#a592c8]">
                                System Fees
                            </span>
                        </div>
                    </div>
                    <select className="bg-[#302447] border-none text-white text-xs rounded-lg py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-primary">
                        <option>30 ngày qua</option>
                        <option>6 tháng qua</option>
                        <option>Từ đầu năm</option>
                    </select>
                </div>
            </div>
            <div className="h-80 relative w-full">
                <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 1000 300"
                >
                    <defs>
                        <linearGradient
                            id="revenueGradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#7c3bed"
                                stopOpacity={0.4}
                            />
                            <stop
                                offset="100%"
                                stopColor="#7c3bed"
                                stopOpacity={0}
                            />
                        </linearGradient>
                        <linearGradient
                            id="feeGradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#60a5fa"
                                stopOpacity={0.2}
                            />
                            <stop
                                offset="100%"
                                stopColor="#60a5fa"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,250 Q125,230 250,150 T500,180 T750,80 T1000,40 V300 H0 Z"
                        fill="url(#revenueGradient)"
                    />
                    <path
                        d="M0,250 Q125,230 250,150 T500,180 T750,80 T1000,40"
                        fill="none"
                        stroke="#7c3bed"
                        strokeLinecap="round"
                        strokeWidth={4}
                    />
                    <path
                        d="M0,280 Q125,270 250,220 T500,240 T750,180 T1000,140 V300 H0 Z"
                        fill="url(#feeGradient)"
                    />
                    <path
                        d="M0,280 Q125,270 250,220 T500,240 T750,180 T1000,140"
                        fill="none"
                        stroke="#60a5fa"
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                        strokeWidth={2}
                    />
                    <circle
                        cx={750}
                        cy={80}
                        fill="#7c3bed"
                        r={6}
                        stroke="#fff"
                        strokeWidth={2}
                    />
                </svg>
                <div className="flex justify-between mt-6 px-2 text-[10px] text-[#a592c8] font-bold uppercase tracking-widest">
                    <span>Oct 01</span>
                    <span>Oct 07</span>
                    <span>Oct 14</span>
                    <span>Oct 21</span>
                    <span>Oct 28</span>
                    <span>Nov 01</span>
                </div>
            </div>
        </div>
    );
}
