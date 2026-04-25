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
        <div className="glass rounded-2xl p-4 sticky top-28 space-y-4">
            {/* Title */}
            <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-widest text-primary">
                    AIPromo Mobile
                </span>
                <h2 className="text-base font-extrabold leading-tight">
                    Check-in sự kiện dễ dàng
                </h2>
                <p className="text-slate-400 text-xs">
                    Hỗ trợ check-in cho nhà tổ chức
                </p>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white rounded-xl">
                    {qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
                    ) : (
                        <div className="w-32 h-32 bg-slate-200 animate-pulse rounded" />
                    )}
                </div>

                <a
                    href={APK_URL}
                    className="flex items-center gap-2 w-full py-2 px-3 bg-primary hover:bg-primary/80 text-white text-sm font-semibold rounded-lg transition-colors justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải APK (Android)
                </a>
                <div className="w-full space-y-1">
                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold">Chia sẻ link</p>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5">
                        <span className="text-[10px] text-slate-400 truncate flex-1 select-all">
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
                            className="shrink-0 p-1 rounded bg-slate-700 hover:bg-primary/30 text-slate-400 hover:text-primary transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}