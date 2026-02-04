export default function PromoSidebar() {
    return (
        <div className="glass rounded-3xl p-6 sticky top-28 space-y-8">
            {/* Title section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <span className="font-bold text-sm uppercase tracking-widest">
                        AIPromo Manager
                    </span>
                </div>
                <h2 className="text-2xl font-extrabold leading-tight">
                    Quản lý sự kiện dễ dàng hơn bao giờ hết
                </h2>
                <p className="text-slate-400 text-sm">
                    Tất cả thông tin doanh thu, số lượng vé và check-in trong lòng
                    bàn tay bạn.
                </p>
            </div>

            {/* Phone mockup */}
            <div className="relative py-4 flex justify-center">
                <div className="w-48 h-80 bg-slate-800 rounded-[2.5rem] border-4 border-slate-700 p-2 shadow-2xl relative z-10 overflow-hidden">
                    <div className="w-full h-full bg-background-dark rounded-[2rem] p-3 flex flex-col gap-4">
                        {/* Notch */}
                        <div className="w-12 h-1 bg-slate-700 mx-auto rounded-full mb-2"></div>

                        {/* Header */}
                        <div className="h-10 bg-primary/20 rounded-lg border border-primary/30 flex items-center px-3">
                            <div className="w-4 h-4 rounded-full bg-primary/40 mr-2"></div>
                            <div className="h-2 w-full bg-primary/20 rounded"></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-900 rounded-xl p-3 space-y-3">
                            <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
                            <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
                            <div className="mt-4 flex gap-2">
                                <div className="h-12 flex-1 bg-primary/40 rounded-lg"></div>
                                <div className="h-12 flex-1 bg-primary/40 rounded-lg"></div>
                            </div>
                            <div className="h-20 w-full bg-primary/10 border border-primary/20 rounded-xl mt-4"></div>
                        </div>
                    </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
            </div>

            {/* Download section */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Tải ứng dụng ngay
                </p>

                {/* QR Code */}
                <div className="flex justify-center pt-4">
                    <div className="p-4 bg-white rounded-2xl">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAjO1BLv2zieiyM4wpHrD_z-VLpX3NSrPBEuvVbRChwOLskCQ9Rmmdq6Gz5QWb7jj9Bsz7dapUSYlfqjc98-6cqvkwN-B-Bkm9eQGiIQdW9WV8vSk16hV_Xv2WLJgxOlgVMai3sdigN1iRAs7bjaY-z9CTby9if44MlFi9ryDHsYxhqoJ0iEziFnMyCvizUqgXiQJseuJXu-iGu9r4lTam170cPBCbENYKDlQLqTucN-pHpjs-7i8D2Wi9_UFNyzpzyditon0UMDs"
                            alt="QR Code"
                            className="w-24 h-24"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}