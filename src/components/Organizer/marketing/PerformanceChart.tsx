import Legend from "./Legend";

export default function PerformanceChart() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center mb-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full mr-3" />
                        Biểu đồ Hiệu suất theo thời gian
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold ml-6">
                        Biểu đồ thể hiện hiệu suất TỔNG của nội dung theo thời gian (đã gộp tất cả nền tảng).
                    </p>
                </div>

                <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
                    <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300">
                        7 ngày
                    </button>
                    <button className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                        30 ngày
                    </button>
                </div>
            </div>

            <div className="glass rounded-[32px] p-8 h-[450px] flex flex-col relative overflow-hidden">
                <div className="flex items-center space-x-6 mb-8">
                    <Legend color="bg-primary" label="Hiển thị" />
                    <Legend color="bg-violet-400/60 border border-violet-400" label="Nhấp chuột" />
                    <Legend color="bg-white/20 border border-white/40" label="Chuyển đổi" />
                </div>

                <div className="flex-1 chart-grid relative flex flex-col justify-between py-4">
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] font-bold text-slate-700 pr-4 pb-12 z-10">
                        {["100K", "80K", "60K", "40K", "20K", "0"].map(v => (
                            <span key={v}>{v}</span>
                        ))}
                    </div>

                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none px-12"
                        preserveAspectRatio="none"
                        viewBox="0 0 1000 300"
                    >
                        <path
                            className="chart-line-glow"
                            d="M0,280 L125,240 L250,260 L375,150 L500,80 L625,110 L750,140 L875,100 L1000,90"
                            fill="none"
                            stroke="#7C3BED"
                            strokeWidth="4"
                        />
                        <path
                            d="M0,290 L125,270 L250,275 L375,220 L500,160 L625,180 L750,200 L875,170 L1000,165"
                            fill="none"
                            stroke="rgba(167,139,250,0.5)"
                            strokeWidth="3"
                        />
                        <path
                            d="M0,295 L125,290 L250,292 L375,270 L500,240 L625,255 L750,265 L875,250 L1000,245"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeDasharray="4,4"
                            strokeWidth="2"
                        />
                    </svg>

                    <div className="flex justify-between px-12 mt-auto pt-4 text-[10px] text-slate-600 font-bold">
                        {["01/01", "05/01", "10/01", "15/01", "20/01", "25/01", "30/01"].map(d => (
                            <span key={d}>{d}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}