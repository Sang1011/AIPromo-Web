import { useEffect, useState } from "react";
import { generateQR } from "../../../utils/generateQR";

export default function PromoSidebar() {
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    useEffect(() => {
        generateQR("https://github.com/Sang1011/AIPromo-mobile/releases/download/v1.0.0/AIPromo.apk")
            .then(setQrUrl)
            .catch(console.error);
    }, []);
    return (
        <div className="glass rounded-3xl p-6 sticky top-28 space-y-8">
            {/* Title section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <span className="font-bold text-sm uppercase tracking-widest">
                        AIPromo Mobile
                    </span>
                </div>
                <h2 className="text-2xl font-extrabold leading-tight">
                    Check-in sự kiện dễ dàng
                </h2>
                <p className="text-slate-400 text-sm">
                    Hỗ trợ check-in tại sự kiện cho nhà tổ chức
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
            <div className="flex flex-col items-center gap-3 pt-4">
                <div className="p-4 bg-white rounded-2xl">
                    {qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-56 h-56" />
                    ) : (
                        <div className="w-56 h-56 bg-slate-200 animate-pulse rounded" />
                    )}
                </div>

                <a
                    href="https://github.com/Sang1011/AIPromo-mobile/releases/download/v1.0.0/AIPromo.apk"
                    download
                    className="flex items-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải APK (Android)
                </a>
            </div>
        </div>
    );
}