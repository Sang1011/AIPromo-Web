import { createPortal } from "react-dom";
import { MdDeleteOutline, MdWarning } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { deleteAIPackage } from "../../../store/aiPackageSlice";

interface Props {
    isOpen: boolean;
    packageId: string | null;
    packageName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function AdminDeletePackageConfirmModal({ isOpen, packageId, packageName, onClose, onConfirm }: Props) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((s: RootState) => s.PACKAGE);
    const deleting = loading?.delete;

    const handleDelete = async () => {
        if (!packageId) return;
        const result = await dispatch(deleteAIPackage(packageId));
        // @ts-ignore
        if (result?.meta?.requestStatus === "fulfilled") {
            onConfirm();
        }
    };

    if (!isOpen || !packageId) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="glass-panel relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Red accent top bar */}
                <div className="h-1 bg-gradient-to-r from-red-600 to-red-400"></div>

                {/* Icon + Content */}
                <div className="px-8 py-8 text-center">
                    {/* Warning icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mb-5">
                        <MdWarning className="text-red-400 text-3xl" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">Xác nhận xóa gói</h3>

                    {/* Package name */}
                    <p className="text-slate-300 text-base">
                        Bạn có chắc muốn xóa gói{" "}
                        <span className="text-violet-400 font-bold">"{packageName}"</span>?
                    </p>

                    {/* Warning note */}
                    <p className="text-slate-500 text-xs italic mt-3">
                        Hành động này không thể hoàn tác.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-8 pb-8 flex items-center justify-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MdDeleteOutline className="text-lg" />
                        {deleting ? "Đang xóa..." : "Xóa gói"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
