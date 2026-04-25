import { MdFacebook } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";

export function EmptyStateFacebook() {
    return (
        <div className="glass rounded-[32px] p-12 border border-slate-800/50 flex flex-col items-center justify-center text-center gap-4">
            <MdFacebook className="text-blue-400/30 text-5xl" />
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu Metrics từ facebook</p>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                    Hiệu suất sẽ hiển thị khi các bài viết được đăng lên Facebook và có dữ liệu metrics.
                </p>
            </div>
        </div>
    );
}

export function EmptyStateInstagram() {
    return (
        <div className="glass rounded-[32px] p-12 border border-slate-800/50 flex flex-col items-center justify-center text-center gap-4">
            <FaInstagram className="text-pink-400/30 text-5xl" />
            <div>
                <p className="text-slate-400 font-semibold">Chưa có dữ liệu Metrics từ Instagram</p>
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                    Hiệu suất sẽ hiển thị khi các bài viết được đăng lên Instagram và có dữ liệu metrics.
                </p>
            </div>
        </div>
    );
}