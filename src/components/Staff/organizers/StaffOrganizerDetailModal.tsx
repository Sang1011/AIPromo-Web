import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MdClose, MdInfo, MdVerifiedUser, MdPayments } from "react-icons/md";
import { fetchGetOrganizerDetail } from "../../../store/organizerProfileSlice";
import type { RootState, AppDispatch } from "../../../store/index";

interface StaffOrganizerDetailModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const glassCard =
    "bg-[rgba(24,18,43,0.8)] backdrop-blur-[12px] border border-[rgba(124,59,237,0.1)]";

export default function StaffOrganizerDetailModal({
    userId,
    isOpen,
    onClose,
}: StaffOrganizerDetailModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedOrganizerDetail } = useSelector(
        (state: RootState) => state.ORGANIZER_PROFILE
    );

    useEffect(() => {
        if (userId && isOpen) {
            dispatch(fetchGetOrganizerDetail(userId));
        }
    }, [userId, isOpen, dispatch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={`${glassCard} w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]`}
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-primary/20 flex items-center justify-between bg-primary/5">
                    <h3 className="text-xl font-bold text-white">
                        Chi tiết hồ sơ Nhà tổ chức
                    </h3>
                    <button
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-8">
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

                {/* Modal Footer */}
                <div className="px-6 py-6 border-t border-primary/20 flex items-center justify-end gap-4 bg-primary/5">
                    <button className="px-6 py-2.5 rounded-xl border border-orange-500/50 text-orange-500 text-sm font-bold hover:bg-orange-500/10 transition-all">
                        Từ chối
                    </button>
                    <button className="px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_30px_rgba(124,59,237,0.6)] hover:scale-[1.02] transition-all">
                        Phê duyệt hồ sơ
                    </button>
                </div>
            </div>
        </div>
    );
}
