import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdClose, MdInfo, MdVerifiedUser, MdPayments, MdWarning } from "react-icons/md";
import { fetchGetOrganizerDetail, fetchVerifyOrganizer, fetchRejectOrganizer } from "../../../store/organizerProfileSlice";
import type { RootState, AppDispatch } from "../../../store/index";
import toast from "react-hot-toast";

interface StaffOrganizerDetailModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onActionSuccess?: () => void;
}

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

export default function StaffOrganizerDetailModal({
    userId,
    isOpen,
    onClose,
    onActionSuccess,
}: StaffOrganizerDetailModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedOrganizerDetail } = useSelector(
        (state: RootState) => state.ORGANIZER_PROFILE
    );
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);
    const [showConfirmReject, setShowConfirmReject] = useState(false);

    useEffect(() => {
        if (userId && isOpen) {
            dispatch(fetchGetOrganizerDetail(userId));
        }
    }, [userId, isOpen, dispatch]);

    const handleApprove = async () => {
        if (!userId) return;
        setIsVerifying(true);
        try {
            const result = await dispatch(fetchVerifyOrganizer(userId)).unwrap();
            if (result?.isSuccess) {
                toast.success("Hồ sơ đã được phê duyệt thành công!");
                handleClose();
                onActionSuccess?.();
            } else {
                toast.error("Phê duyệt hồ sơ thất bại");
            }
        } catch (error: any) {
            toast.error(error?.message || "Có lỗi xảy ra khi phê duyệt");
        } finally {
            setIsVerifying(false);
            setShowConfirmApprove(false);
        }
    };

    const handleReject = async () => {
        if (!userId) return;
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }
        setIsRejecting(true);
        try {
            const result = await dispatch(fetchRejectOrganizer({ userId, reason: rejectReason })).unwrap();
            if (result?.isSuccess) {
                toast.success("Hồ sơ đã bị từ chối!");
                handleClose();
                onActionSuccess?.();
            } else {
                toast.error("Từ chối hồ sơ thất bại");
            }
        } catch (error: any) {
            toast.error(error?.message || "Có lỗi xảy ra khi từ chối");
        } finally {
            setIsRejecting(false);
            setShowConfirmReject(false);
            setShowRejectInput(false);
            setRejectReason("");
        }
    };

    const handleClose = () => {
        setShowRejectInput(false);
        setRejectReason("");
        setShowConfirmApprove(false);
        setShowConfirmReject(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={handleClose} />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={`${glassCard} w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto`}
                >
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-primary/20 flex items-center justify-between bg-primary/5 shrink-0 sticky top-0 z-10">
                        <h3 className="text-xl font-bold text-white">
                            Chi tiết hồ sơ Nhà tổ chức
                        </h3>
                        <button
                            onClick={handleClose}
                            className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-6 pt-8">
                    {/* Section 1: Thông tin cơ bản */}
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                            <MdInfo className="text-sm" /> Thông tin cơ bản
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Tên hiển thị
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.displayName || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Loại hình
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.businessType || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Lĩnh vực kinh doanh
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.type || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Mô tả
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.description || "-"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Thông tin định danh */}
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                            <MdVerifiedUser className="text-sm" /> Thông tin định danh
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Tên công ty
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.companyName || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Mã số thuế
                                </p>
                                <p className="text-primary font-bold">
                                    {selectedOrganizerDetail?.taxCode || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Số định danh / CCCD
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.identityNumber || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Địa chỉ
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.address || "-"}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Mạng xã hội
                                </p>
                                <a
                                    className="text-primary hover:underline font-medium"
                                    href={selectedOrganizerDetail?.socialLink || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {selectedOrganizerDetail?.socialLink || "-"}
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Thông tin thanh toán */}
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                            <MdPayments className="text-sm" /> Thông tin thanh toán
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Ngân hàng
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.bankCode || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Chi nhánh
                                </p>
                                <p className="text-white font-medium">
                                    {selectedOrganizerDetail?.branch || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Tên tài khoản
                                </p>
                                <p className="text-white font-bold">
                                    {selectedOrganizerDetail?.accountName || "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase text-slate-500 font-bold mb-1">
                                    Số tài khoản
                                </p>
                                <p className="text-primary text-lg font-bold">
                                    {selectedOrganizerDetail?.accountNumber || "-"}
                                </p>
                            </div>
                        </div>
                    </section>
                        </div>
                    </div>

                    {/* Reject Reason Input */}
                    {showRejectInput && (
                        <div className="px-6 py-4 border-t border-primary/20 bg-primary/5 shrink-0">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                                Lí do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lí do từ chối..."
                                className="w-full bg-slate-800/50 border border-primary/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                rows={4}
                            />
                        </div>
                    )}

                    {/* Modal Footer */}
                    <div className="px-6 py-6 border-t border-primary/20 flex items-center justify-end gap-4 bg-primary/5 shrink-0 sticky bottom-0 z-10">
                        <button
                            onClick={() => {
                                if (showRejectInput) {
                                    setShowConfirmReject(true);
                                } else {
                                    setShowRejectInput(true);
                                }
                            }}
                            disabled={isRejecting}
                            className="px-6 py-2.5 rounded-xl border border-orange-500/50 text-orange-500 text-sm font-bold hover:bg-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRejecting ? "Đang xử lý..." : showRejectInput ? "Xác nhận từ chối" : "Từ chối"}
                        </button>
                        <button
                            onClick={() => setShowConfirmApprove(true)}
                            disabled={isVerifying}
                            className="px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_30px_rgba(124,59,237,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? "Đang xử lý..." : "Phê duyệt hồ sơ"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal - Approve */}
            {showConfirmApprove && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className={`${glassCard} w-full max-w-md rounded-2xl overflow-hidden shadow-2xl`}>
                        <div className="px-6 py-4 border-b border-primary/20 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <MdVerifiedUser className="text-emerald-500 text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Xác nhận phê duyệt</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-slate-300 text-sm">
                                Bạn có chắc chắn muốn <span className="text-emerald-500 font-bold">phê duyệt</span> hồ sơ của{" "}
                                <span className="text-primary font-bold">{selectedOrganizerDetail?.displayName}</span>?
                            </p>
                            <p className="text-slate-400 text-xs mt-2">
                                Hành động này sẽ không thể hoàn tác.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-primary/20 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmApprove(false)}
                                disabled={isVerifying}
                                className="px-5 py-2.5 rounded-xl border border-slate-500/50 text-slate-400 text-sm font-bold hover:bg-slate-500/10 transition-all disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isVerifying}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                {isVerifying ? "Đang xử lý..." : "Phê duyệt"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal - Reject */}
            {showConfirmReject && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className={`${glassCard} w-full max-w-md rounded-2xl overflow-hidden shadow-2xl`}>
                        <div className="px-6 py-4 border-b border-primary/20 flex items-center gap-3">
                            <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <MdWarning className="text-red-500 text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Xác nhận từ chối</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-slate-300 text-sm">
                                Bạn có chắc chắn muốn <span className="text-red-500 font-bold">từ chối</span> hồ sơ của{" "}
                                <span className="text-primary font-bold">{selectedOrganizerDetail?.displayName}</span>?
                            </p>
                            <p className="text-slate-400 text-xs mt-2">
                                Hành động này sẽ không thể hoàn tác.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-primary/20 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmReject(false);
                                    setShowRejectInput(false);
                                    setRejectReason("");
                                }}
                                disabled={isRejecting}
                                className="px-5 py-2.5 rounded-xl border border-slate-500/50 text-slate-400 text-sm font-bold hover:bg-slate-500/10 transition-all disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isRejecting}
                                className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {isRejecting ? "Đang xử lý..." : "Từ chối"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
