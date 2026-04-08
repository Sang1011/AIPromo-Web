import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import userService, { type CreateUserRequest } from "../../../services/userService";
import toast from "react-hot-toast";

interface CreateStaffUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStaffUserModal({ isOpen, onClose, onSuccess }: CreateStaffUserModalProps) {
    const [form, setForm] = useState<CreateUserRequest>({
        email: "",
        userName: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        role: "Staff", // Auto-set to Staff
    });

    const [errors, setErrors] = useState<Partial<CreateUserRequest>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setForm({
                email: "",
                userName: "",
                password: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                address: "",
                role: "Staff",
            });
            setErrors({});
        }
    }, [isOpen]);

    const validate = (): boolean => {
        const newErrors: Partial<CreateUserRequest> = {};

        if (!form.email.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!form.userName.trim()) {
            newErrors.userName = "Username là bắt buộc";
        } else if (form.userName.length < 3) {
            newErrors.userName = "Username phải có ít nhất 3 ký tự";
        }

        if (!form.password.trim()) {
            newErrors.password = "Password là bắt buộc";
        } else if (form.password.length < 8) {
            newErrors.password = "Password phải có ít nhất 8 ký tự";
        }

        if (!form.firstName.trim()) {
            newErrors.firstName = "Tên là bắt buộc";
        }

        if (!form.lastName.trim()) {
            newErrors.lastName = "Họ là bắt buộc";
        }

        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = "Số điện thoại là bắt buộc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setSubmitting(true);
        try {
            await userService.createStaffUser(form);
            toast.success("Tạo tài khoản staff thành công!");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || "Tạo tài khoản thất bại. Vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const modal = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) onClose();
            }}
        >
            <div className="w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-b from-[#1e1638] to-[#100d1f] border border-[rgba(124,59,237,0.3)] shadow-2xl animate-slideUp max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">Tạo tài khoản Staff</h3>
                        <p className="text-sm text-[#a592c8] mt-1">Tạo tài khoản mới cho nhân viên hệ thống</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="text-slate-400 hover:text-white hover:bg-white/10 transition-all rounded-lg p-2 disabled:opacity-50"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="col-span-2">
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.email ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="staff@example.com"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Username <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.userName}
                                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.userName ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="staff.username"
                            />
                            {errors.userName && <p className="text-red-400 text-xs mt-1">{errors.userName}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.password ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Tên <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.firstName ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="Minh"
                            />
                            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Họ <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.lastName ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="Nguyen Van"
                            />
                            {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Số điện thoại <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                className={`w-full rounded-xl bg-black/40 border ${
                                    errors.phoneNumber ? "border-red-500" : "border-white/10 focus:border-primary"
                                } py-2.5 px-4 text-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20`}
                                placeholder="0123456789"
                            />
                            {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
                        </div>

                        {/* Role (Auto - Staff) */}
                        <div>
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Vai trò
                            </label>
                            <div className="w-full rounded-xl bg-amber-500/10 border border-amber-500/30 py-2.5 px-4 text-amber-400 text-sm font-semibold flex items-center gap-2">
                                <span className="text-lg">👤</span> Staff
                            </div>
                            <p className="text-[#6b5b86] text-xs mt-1">Vai trò sẽ tự động là Staff</p>
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label className="text-sm text-[#a592c8] mb-2 block font-medium">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full rounded-xl bg-black/40 border border-white/10 py-2.5 px-4 text-white text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 flex-shrink-0 bg-white/5">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="py-2.5 px-6 rounded-xl border border-white/10 text-[#a592c8] hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="py-2.5 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.4)] disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Đang tạo...
                            </>
                        ) : (
                            "Tạo tài khoản"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
