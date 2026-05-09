import { MdOutlineAutoAwesome, MdOutlineOpenInNew, MdOutlineToken } from "react-icons/md";

export const INSUFFICIENT_TOKEN_KEY = "Insufficient AI tokens";

export function isInsufficientTokenError(msg: string | null | undefined): boolean {
    if (!msg) return false;
    return (
        msg.includes(INSUFFICIENT_TOKEN_KEY) ||
        msg.includes("AiQuota.InsufficientTokens") ||
        msg.includes("Không đủ token")
    );
}

interface Props {
    upgradeHref?: string;
    className?: string;
}

export default function InsufficientTokenCard({ upgradeHref = "/organizer/subscription", className = "" }: Props) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-amber-500/25
                        bg-gradient-to-br from-amber-950/40 via-background-dark/60 to-orange-950/30
                        px-5 py-5 space-y-4 ${className}`}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute -top-6 -right-6 w-28 h-28
                           rounded-full bg-amber-500/10 blur-2xl"
            />

            <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20
                                flex items-center justify-center">
                    <MdOutlineToken className="text-amber-400 text-lg" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-sm font-bold text-amber-300 leading-tight">
                        Không đủ token AI
                    </p>
                    <p className="text-xs text-amber-400/70 leading-relaxed">
                        Bạn đã dùng hết lượt tạo nội dung AI trong kỳ hiện tại.
                        Nâng cấp gói để tiếp tục sử dụng tính năng này.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    "Tạo nội dung AI",
                    "Tạo ảnh AI"
                ].map((f) => (
                    <span
                        key={f}
                        className="flex items-center gap-1 text-[10px] font-semibold
                                   text-amber-300/80 bg-amber-500/10 border border-amber-500/15
                                   rounded-full px-2.5 py-1"
                    >
                        <MdOutlineAutoAwesome className="text-amber-400 text-xs" />
                        {f}
                    </span>
                ))}
            </div>

            {/* CTA */}
            <a
                href={upgradeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full
                           py-3 rounded-xl text-sm font-bold
                           bg-amber-500 hover:bg-amber-400
                           text-amber-950 transition-all
                           shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
                <MdOutlineOpenInNew className="text-base" />
                Đăng ký gói ngay
            </a>
        </div>
    );
}