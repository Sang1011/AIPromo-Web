import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdAccountBalanceWallet, MdNotes, MdContentCopy, MdVerifiedUser, MdCancel, MdCheckCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchWithdrawalDetail, clearWithdrawalDetail } from "../../../store/withdrawalSlice";

interface WithdrawalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    withdrawalId: string | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} • ${day}/${month}/${year}`;
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case "Pending":
            return {
                label: "Chờ phê duyệt",
                color: "text-amber-400",
                dotColor: "bg-amber-400"
            };
        case "Approved":
            return {
                label: "Đã duyệt",
                color: "text-blue-400",
                dotColor: "bg-blue-400"
            };
        case "Success":
            return {
                label: "Thành công",
                color: "text-emerald-400",
                dotColor: "bg-emerald-400"
            };
        case "Rejected":
            return {
                label: "Từ chối",
                color: "text-red-400",
                dotColor: "bg-red-400"
            };
        default:
            return {
                label: "Không rõ",
                color: "text-slate-400",
                dotColor: "bg-slate-400"
            };
    }
};

const getBankLogoUrl = (bankName: string) => {
    const bankLogos: Record<string, string> = {
        "vietcombank": "https://lh3.googleusercontent.com/aida-public/AB6AXuCDKotW9Lt0EB5y7znUZ7xLh0IuKeJ54j0dWt12cAkqQZRvWWOr9DUqKMXqZHWcZVlv2TPdwsGW8tFmixWo20oJ6eoYR9wZW0VDBgvAzbQ7giKuVeocJrvKB2K_0VSpzISZaLL0kfVAaXNjyg30B7BBbxcgbfFRZUoNiL0N5CYCDT9SyiXTTrInXTweMHwMwST_0TAdXqPaqvSPVlo7UkdDTnaiwFN-lsxTPiLsEJQShYeSt9svRck2AkFJUPVrt5zHsDzS-ILoc9ss",
        "techcombank": "https://lh3.googleusercontent.com/aida-public/AB6AXuCDKotW9Lt0EB5y7znUZ7xLh0IuKeJ54j0dWt12cAkqQZRvWWOr9DUqKMXqZHWcZVlv2TPdwsGW8tFmixWo20oJ6eoYR9wZW0VDBgvAzbQ7giKuVeocJrvKB2K_0VSpzISZaLL0kfVAaXNjyg30B7BBbxcgbfFRZUoNiL0N5CYCDT9SyiXTTrInXTweMHwMwST_0TAdXqPaqvSPVlo7UkdDTnaiwFN-lsxTPiLsEJQShYeSt9svRck2AkFJUPVrt5zHsDzS-ILoc9ss",
        "mb bank": "https://lh3.googleusercontent.com/aida-public/AB6AXuCDKotW9Lt0EB5y7znUZ7xLh0IuKeJ54j0dWt12cAkqQZRvWWOr9DUqKMXqZHWcZVlv2TPdwsGW8tFmixWo20oJ6eoYR9wZW0VDBgvAzbQ7giKuVeocJrvKB2K_0VSpzISZaLL0kfVAaXNjyg30B7BBbxcgbfFRZUoNiL0N5CYCDT9SyiXTTrInXTweMHwMwST_0TAdXqPaqvSPVlo7UkdDTnaiwFN-lsxTPiLsEJQShYeSt9svRck2AkFJUPVrt5zHsDzS-ILoc9ss",
        "bidv": "https://lh3.googleusercontent.com/aida-public/AB6AXuCDKotW9Lt0EB5y7znUZ7xLh0IuKeJ54j0dWt12cAkqQZRvWWOr9DUqKMXqZHWcZVlv2TPdwsGW8tFmixWo20oJ6eoYR9wZW0VDBgvAzbQ7giKuVeocJrvKB2K_0VSpzISZaLL0kfVAaXNjyg30B7BBbxcgbfFRZUoNiL0N5CYCDT9SyiXTTrInXTweMHwMwST_0TAdXqPaqvSPVlo7UkdDTnaiwFN-lsxTPiLsEJQShYeSt9svRck2AkFJUPVrt5zHsDzS-ILoc9ss"
    };
    
    const bankKey = Object.keys(bankLogos).find(key => 
        bankName.toLowerCase().includes(key)
    );
    return bankLogos[bankKey || "vietcombank"];
};

export default function WithdrawalDetailModal({ isOpen, onClose, withdrawalId }: WithdrawalDetailModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { withdrawalDetail, loading } = useSelector((state: RootState) => state.WITHDRAWAL);

    useEffect(() => {
        if (isOpen && withdrawalId) {
            dispatch(fetchWithdrawalDetail(withdrawalId));
        }
        return () => {
            dispatch(clearWithdrawalDetail());
        };
    }, [dispatch, isOpen, withdrawalId]);

    const handleCopyAccountNumber = () => {
        if (withdrawalDetail?.bankAccountNumber) {
            navigator.clipboard.writeText(withdrawalDetail.bankAccountNumber);
        }
    };

    const handleApprove = () => {
        console.log("Approve withdrawal:", withdrawalDetail?.id);
        // TODO: Implement approve API call
    };

    const handleReject = () => {
        console.log("Reject withdrawal:", withdrawalDetail?.id);
        // TODO: Implement reject API call
    };

    if (!isOpen || !withdrawalDetail) return null;

    const statusConfig = getStatusConfig(withdrawalDetail.status);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0a0516]/90 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-[#0f172a] border border-[#302447] shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="relative px-6 py-5 border-b border-[#302447]">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#7c3bed]/10 flex items-center justify-center border border-[#7c3bed]/20">
                                <MdAccountBalanceWallet className="text-[#7c3bed] text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Chi tiết yêu cầu rút tiền</h3>
                                <p className="text-[10px] text-[#a592c8] mt-0.5">Yêu cầu được thực hiện từ ví hệ thống</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-[#a592c8] hover:text-white"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-[#7c3bed] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column - Financial Info */}
                            <div className="space-y-4">
                                {/* Amount Card */}
                                <div className="p-5 rounded-xl bg-[#1a1625] border border-[#302447]">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a592c8]">Số tiền rút</label>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-3xl font-black text-white">{formatCurrency(withdrawalDetail.amount)}</span>
                                        <span className="text-base font-bold text-[#7c3bed]">VND</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#302447] grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#a592c8]">Trạng thái</label>
                                            <div className={`flex items-center gap-1.5 mt-1 ${statusConfig.color}`}>
                                                <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                                                <span className="text-xs font-semibold">{statusConfig.label}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#a592c8]">Thời gian tạo</label>
                                            <p className="text-xs text-slate-300 mt-1">{formatDate(withdrawalDetail.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Card */}
                                {withdrawalDetail.notes && (
                                    <div className="p-5 rounded-xl bg-[#1a1625] border border-[#302447]">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#a592c8] flex items-center gap-2">
                                            <MdNotes className="text-[14px]" />
                                            Ghi chú từ người dùng
                                        </label>
                                        <p className="mt-3 text-sm text-slate-300 leading-relaxed italic">
                                            "{withdrawalDetail.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Bank Info */}
                            <div className="p-5 rounded-xl bg-[#1a1625]/50 border border-[#302447]">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#7c3bed]">Thông tin thụ hưởng</label>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <p className="text-[10px] text-[#a592c8] uppercase">Ngân hàng</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-6 h-6 rounded bg-white flex items-center justify-center p-1">
                                                <img 
                                                    alt="Bank Logo" 
                                                    className="object-contain w-full h-full" 
                                                    src={getBankLogoUrl(withdrawalDetail.bankName)}
                                                />
                                            </div>
                                            <p className="text-sm font-bold text-white uppercase tracking-wide">{withdrawalDetail.bankName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#a592c8] uppercase">Số tài khoản</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-base font-mono font-bold text-[#7c3bed] tracking-tighter">
                                                {withdrawalDetail.bankAccountNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                                            </p>
                                            <button 
                                                onClick={handleCopyAccountNumber}
                                                className="p-1.5 hover:bg-white/5 rounded transition-colors text-[#a592c8] hover:text-white"
                                            >
                                                <MdContentCopy className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#a592c8] uppercase">Chủ tài khoản</p>
                                        <p className="text-xs font-medium text-slate-300 mt-1 break-all">
                                            {withdrawalDetail.userId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-[#302447] bg-[#0f172a]/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[#a592c8]">
                        <MdVerifiedUser className="text-lg" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Đã kiểm tra bảo mật</span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleReject}
                            className="px-6 py-2.5 rounded-lg border border-red-500/30 text-red-400 font-semibold text-sm transition-all hover:bg-red-500/10 flex items-center gap-2"
                        >
                            <MdCancel className="text-sm" />
                            Từ chối
                        </button>
                        <button 
                            onClick={handleApprove}
                            className="px-6 py-2.5 rounded-lg bg-[#7c3bed] text-white font-semibold text-sm transition-all hover:bg-[#6d28d9] flex items-center gap-2 shadow-lg shadow-[#7c3bed]/20"
                        >
                            <MdCheckCircle className="text-sm" />
                            Phê duyệt
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
