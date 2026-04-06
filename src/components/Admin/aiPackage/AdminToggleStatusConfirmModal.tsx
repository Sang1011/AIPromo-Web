import { createPortal } from "react-dom";
import { MdToggleOn } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { togglePackageStatus } from "../../../store/aiPackageSlice";

interface Props {
    isOpen: boolean;
    packageId: string | null;
    packageName: string;
    currentStatus: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function AdminToggleStatusConfirmModal({ isOpen, packageId, packageName, currentStatus, onClose, onConfirm }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((s: RootState) => s.PACKAGE);
    const toggling = loading?.toggleStatus;

    const handleToggle = async () => {
        if (!packageId) return;
        const result = await dispatch(togglePackageStatus(packageId));
        // @ts-ignore
        if (result?.meta?.requestStatus === "fulfilled") {
            onConfirm();
        }
    };

    if (!isOpen || !packageId) return null;

    const nextStatus = !currentStatus;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-panel relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Accent top bar */}
                <div className={`h-1 ${nextStatus ? 'bg-gradient-to-r from-violet-600 to-violet-400' : 'bg-gradient-to-r from-slate-600 to-slate-400'}`}></div>

                {/* Icon + Content */}
                <div className="px-8 py-8 text-center">
                    {/* Status icon */}
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
                        nextStatus
                            ? 'bg-violet-500/10 border-2 border-violet-500/20'
                            : 'bg-slate-600/10 border-2 border-slate-500/20'
                    }`}>
                        <MdToggleOn className={`text-3xl ${nextStatus ? 'text-violet-400' : 'text-slate-400'}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">Xác nhận chuyển trạng thái</h3>

                    {/* Package name */}
                    <p className="text-slate-300 text-base">
                        Bạn có muốn{" "}
                        <span className={`font-bold ${nextStatus ? 'text-violet-400' : 'text-slate-400'}`}>
                            {nextStatus ? "kích hoạt" : "tạm ngưng"}
                        </span>
                        {" "}gói{" "}
                        <span className="text-violet-400 font-bold">"{packageName}"</span>?
                    </p>

                    {/* Warning note */}
                    <p className="text-slate-500 text-xs italic mt-3">
                        Hành động này sẽ thay đổi trạng thái hiển thị của gói trên hệ thống.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex items-center justify-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={toggling}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            nextStatus
                                ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20'
                                : 'bg-slate-600 hover:bg-slate-500 shadow-slate-600/20'
                        }`}
                    >
                        <MdToggleOn className="text-lg" />
                        {toggling ? "Đang xử lý..." : (nextStatus ? "Kích hoạt" : "Tạm ngưng")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
