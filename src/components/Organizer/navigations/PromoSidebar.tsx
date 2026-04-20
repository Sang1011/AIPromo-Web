import { useEffect, useState } from "react";
import { generateQR } from "../../../utils/generateQR";
import { notify } from "../../../utils/notify";

export default function PromoSidebar() {
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const APK_URL = "https://apkpure.com/p/com.sangnguyen1011.aipromomobile";
    useEffect(() => {
        generateQR(APK_URL)
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

            {/* Download section */}
            <div className="flex flex-col items-center gap-3 pt-4">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
                <div className="p-4 bg-white rounded-2xl">
                    {qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-56 h-56" />
                    ) : (
                        <div className="w-56 h-56 bg-slate-200 animate-pulse rounded" />
                    )}
                </div>

                <a
                    href={APK_URL}
                    className="flex items-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-colors justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải APK (Android)
                </a>
                <div className="w-full space-y-2">
                    <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-semibold">Chia sẻ link tải</p>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                        <span className="text-xs text-slate-400 truncate flex-1 select-all">
                            https://apkpure.com/p/com.sangnguyen1011.aipromomobile
                        </span>
                        <button
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(APK_URL);
                                    notify.success("Đã copy link!");
                                } catch {
                                    notify.error("Không thể copy!");
                                }
                            }}
                            className="shrink-0 p-1.5 rounded-lg bg-slate-700 hover:bg-primary/30 text-slate-400 hover:text-primary transition-colors"
                            title="Sao chép link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}