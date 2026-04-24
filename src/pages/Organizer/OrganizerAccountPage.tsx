import { useEffect, useRef, useState } from "react";
import { FiCamera, FiCheck, FiCreditCard, FiFileText, FiGlobe, FiMapPin, FiUser } from "react-icons/fi";
import { MdOutlineBusiness, MdOutlinePerson } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useOutletContext } from "react-router-dom";
import BankSelect from "../../components/Organizer/bank/BankSelect";
import ConfirmModal from "../../components/Organizer/shared/ConfirmModal";
import ImageViewer from "../../components/Organizer/shared/ImagePreview";
import { BANKS } from "../../constants/bank";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchCreateProfileOrganizer,
    fetchGetOrganizerProfileDetailById,
    fetchVerifyProfileOrganizer,
} from "../../store/organizerProfileSlice";
import type { ApiResponse } from "../../types/api";
import type { MeInfo } from "../../types/auth/auth";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";
import { OrganizerStatus, type OrganizerProfileDetail } from "../../types/organizerProfile/organizerProfile";
import { notify } from "../../utils/notify";

type Tab = "profileDetail" | "bank";
type BusinessType = "individual" | "company";

interface ProfileErrors {
    displayName?: string;
    companyName?: string;
    taxCode?: string;
    identityNumber?: string;
}

interface BankErrors {
    accountName?: string;
    accountNumber?: string;
    bankCode?: string;
    branch?: string;
}

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

export default function OrganizerAccountPage() {
    const dispatch = useDispatch<AppDispatch>();
    const profileDetail = useSelector((state: RootState) => state.ORGANIZER_PROFILE.profileDetail);
    const { currentInfor } = useSelector((s: RootState) => s.AUTH);
    const { setConfig } = useOutletContext<DashboardContext>();

    const [pageLoading, setPageLoading] = useState(!profileDetail);
    const [activeTab, setActiveTab] = useState<Tab>("profileDetail");

    // profile fields
    const [displayName, setDisplayName] = useState("");
    const [description, setDescription] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const [address, setAddress] = useState("");
    const [businessType, setBusinessType] = useState<BusinessType>("individual");
    const [identityNumber, setIdentityNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
    const [profileLoading, setProfileLoading] = useState(false);

    // bank fields
    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [branch, setBranch] = useState("");
    const [bankErrors, setBankErrors] = useState<BankErrors>({});
    const [bankLoading, setBankLoading] = useState(false);

    const location = useLocation();

    // logo
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [viewingLogo, setViewingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // confirm modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingSaveType, setPendingSaveType] = useState<"profile" | "bank" | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const refetchProfile = async () => {
        if (userId) await dispatch(fetchGetOrganizerProfileDetailById(userId));
    };

    useEffect(() => {
        setConfig({ title: "Quản lý tài khoản" });
        return () => setConfig({});
    }, []);

    useEffect(() => {
        const state = location.state as { missingFields?: string[]; tab?: Tab } | null;
        if (state?.tab) setActiveTab(state.tab);
        if (state?.missingFields?.length) {
            const fields = state.missingFields;
            const newProfileErrors: ProfileErrors = {};
            if (fields.includes("displayName")) newProfileErrors.displayName = "Tên hiển thị không được để trống";
            if (fields.includes("identityNumber")) {
                if (businessType === "individual") {
                    newProfileErrors.identityNumber = "Số CMND / CCCD không được để trống"
                }
            };
            if (fields.includes("taxCode")) newProfileErrors.taxCode = "Mã số thuế không được để trống";
            if (fields.includes("companyName")) newProfileErrors.companyName = "Tên công ty không được để trống";
            setProfileErrors(newProfileErrors);

            const newBankErrors: BankErrors = {};
            if (fields.includes("accountName")) newBankErrors.accountName = "Chủ tài khoản không được để trống";
            if (fields.includes("accountNumber")) newBankErrors.accountNumber = "Số tài khoản không được để trống";
            if (fields.includes("bankCode")) newBankErrors.bankCode = "Vui lòng chọn ngân hàng";
            if (fields.includes("branch")) newBankErrors.branch = "Chi nhánh không được để trống";
            setBankErrors(newBankErrors);
        }
    }, [location.state]);

    const fillForm = (data: OrganizerProfileDetail) => {
        setDisplayName(data.displayName ?? "");
        setDescription(data.description ?? "");
        setSocialLink(data.socialLink ?? "");
        setAddress(data.address ?? "");
        setBusinessType((data.businessType?.toLowerCase() as BusinessType) ?? "individual");
        setCompanyName(data.companyName ?? "");
        setTaxCode(data.taxCode ?? "");
        setIdentityNumber(data.identityNumber ?? "");
        setBankCode(data.bankCode ?? "");
        setAccountName(data.accountName ?? "");
        setAccountNumber(data.accountNumber ?? "");
        setBranch(data.branch ?? "");
        setLogoPreview(data.logo ?? "");
    };

    const userId = (currentInfor as MeInfo)?.userId;

    useEffect(() => {
        const init = async () => {
            if (!userId) {
                setPageLoading(false);
                return;
            }
            if (!profileDetail) setPageLoading(true);

            const detailResult = await dispatch(fetchGetOrganizerProfileDetailById(userId));
            if (fetchGetOrganizerProfileDetailById.fulfilled.match(detailResult)) {
                const data = (detailResult.payload as ApiResponse<OrganizerProfileDetail>)?.data;
                if (data) fillForm(data);
            }
            setPageLoading(false);
        };
        init();
    }, [dispatch, userId]);

    const statusBannerInfo = (status: OrganizerStatus | undefined) => {
        switch (status) {
            case OrganizerStatus.Draft:
                return {
                    bg: "bg-yellow-500/5",
                    border: "border-yellow-500/20",
                    color: "#eab308",
                    textColor: "text-yellow-400",
                    subColor: "text-yellow-300/70",
                    label: "Hồ sơ chưa được nộp",
                    reason: "Hồ sơ của bạn đang ở trạng thái nháp. Vui lòng điền đầy đủ thông tin, lưu lại và nộp lên để được kiểm duyệt.",
                };
            case OrganizerStatus.Pending:
                return {
                    bg: "bg-blue-500/5",
                    border: "border-blue-500/20",
                    color: "#3b82f6",
                    textColor: "text-blue-400",
                    subColor: "text-blue-300/70",
                    label: "Hồ sơ đang được kiểm duyệt",
                    reason: "Hồ sơ của bạn đang được xem xét bởi đội ngũ staff. Quá trình này thường mất 2–3 ngày làm việc.",
                };
            case OrganizerStatus.Verified:
                return {
                    bg: "bg-emerald-500/5",
                    border: "border-emerald-500/20",
                    color: "#10b981",
                    textColor: "text-emerald-400",
                    subColor: "text-emerald-300/70",
                    label: "Hồ sơ đã được xác minh",
                    reason: "Hồ sơ của bạn đã được kiểm duyệt thành công. Bạn có thể đăng sự kiện public.",
                };
            case OrganizerStatus.Rejected:
                return {
                    bg: "bg-red-500/5",
                    border: "border-red-500/20",
                    color: "#ef4444",
                    textColor: "text-red-400",
                    subColor: "text-red-300/70",
                    label: "Hồ sơ bị từ chối",
                    reason: "Hồ sơ của bạn không được chấp thuận. Vui lòng kiểm tra lại thông tin và nộp lại.",
                };
            default:
                return null;
        }
    };

    const validateProfile = (): boolean => {
        const errors: ProfileErrors = {};
        if (!displayName.trim()) errors.displayName = "Tên hiển thị không được để trống";
        if (businessType === "individual") {
            if (!identityNumber.trim()) errors.identityNumber = "Số CMND / CCCD không được để trống";
            else if (!/^\d{9}$|^\d{12}$/.test(identityNumber)) errors.identityNumber = "Số CMND / CCCD phải có 9 hoặc 12 chữ số";
            if (!taxCode.trim()) errors.taxCode = "Mã số thuế không được để trống";
            else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(taxCode)) errors.taxCode = "Mã số thuế không hợp lệ (10 hoặc 13 chữ số)";
        }
        if (businessType === "company") {
            if (!companyName.trim()) errors.companyName = "Tên công ty không được để trống";
            if (!taxCode.trim()) errors.taxCode = "Mã số thuế không được để trống";
            else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(taxCode)) errors.taxCode = "Mã số thuế không hợp lệ (10 hoặc 13 chữ số)";
        }
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateBank = (): boolean => {
        const errors: BankErrors = {};
        if (!accountName.trim()) errors.accountName = "Chủ tài khoản không được để trống";
        if (!accountNumber.trim()) errors.accountNumber = "Số tài khoản không được để trống";
        else if (!/^\d{6,20}$/.test(accountNumber)) errors.accountNumber = "Số tài khoản phải từ 6 đến 20 chữ số";
        if (!bankCode) errors.bankCode = "Vui lòng chọn ngân hàng";
        if (!branch.trim()) errors.branch = "Chi nhánh không được để trống";
        setBankErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const executeCreateAndVerify = async (type: "profile" | "bank") => {
        const setLoading = type === "profile" ? setProfileLoading : setBankLoading;
        setLoading(true);
        try {
            const result = await dispatch(
                fetchCreateProfileOrganizer({
                    type: profileDetail?.type ?? "",
                    logoFile: logoFile ?? (profileDetail?.logo as unknown as File),
                    logo: profileDetail?.logo ?? null,
                    displayName,
                    description,
                    socialLink,
                    address,
                    businessType,
                    companyName: businessType === "company" ? companyName : "",
                    taxCode,
                    identityNumber,
                    accountName,
                    accountNumber,
                    bankCode,
                    branch,
                })
            );

            if (fetchCreateProfileOrganizer.rejected.match(result)) {
                notify.error("Không thể cập nhật thông tin");
                return;
            }

            const verifyResult = await dispatch(fetchVerifyProfileOrganizer());
            if (fetchVerifyProfileOrganizer.rejected.match(verifyResult)) {
                notify.error("Cập nhật thành công nhưng không thể gửi kiểm duyệt");
            } else {
                notify.success("Cập nhật thành công. Hồ sơ đang chờ kiểm duyệt.");
                setLogoFile(null);
            }

            await refetchProfile();
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = () => {
        const status = profileDetail?.status;
        if (status === OrganizerStatus.Pending) {
            notify.error("Hồ sơ của bạn đang trong quá trình kiểm duyệt. Sau khi chỉnh sửa và lưu, hồ sơ sẽ được đặt lại về trạng thái 'Đang kiểm duyệt' và bạn sẽ nhận được thông báo khi có kết quả kiểm duyệt mới.");
            return;
        }
        if (!validateProfile()) return;
        setPendingSaveType("profile");
        setConfirmOpen(true);
    };

    const handleSaveBank = () => {
        const status = profileDetail?.status;
        if (status === OrganizerStatus.Pending) {
            notify.error("Hồ sơ của bạn đang trong quá trình kiểm duyệt. Sau khi chỉnh sửa và lưu, hồ sơ sẽ được đặt lại về trạng thái 'Đang kiểm duyệt' và bạn sẽ nhận được thông báo khi có kết quả kiểm duyệt mới.");
            return;
        }
        if (!validateBank()) return;
        setPendingSaveType("bank");
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setConfirmOpen(false);
        if (pendingSaveType) await executeCreateAndVerify(pendingSaveType);
        setPendingSaveType(null);
    };

    const handleCancelConfirm = () => {
        setConfirmOpen(false);
        setPendingSaveType(null);
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "profileDetail", label: "Thông tin tổ chức", icon: <MdOutlineBusiness /> },
        { key: "bank", label: "Tài khoản ngân hàng", icon: <FiCreditCard /> },
    ];

    // ✅ Loading screen
    if (pageLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <span className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mx-auto">
            {(() => {
                const info = statusBannerInfo(profileDetail?.status);
                if (!info) return null;
                return (
                    <div
                        className={`flex gap-3 rounded-xl border ${info.border} ${info.bg} px-5 py-4`}
                        style={{ borderLeftWidth: "3px", borderLeftColor: info.color }}
                    >
                        <svg className={`mt-0.5 shrink-0 ${info.textColor}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M9 5.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <circle cx="9" cy="12.5" r="0.7" fill="currentColor" />
                        </svg>
                        <div className="space-y-1">
                            <p className={`text-sm font-semibold ${info.textColor}`}>{info.label}</p>
                            <p className={`text-sm ${info.subColor}`}>{info.reason}</p>
                        </div>
                    </div>
                );
            })()}
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${activeTab === tab.key
                                ? "bg-primary text-white shadow-lg shadow-primary/30"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Thông tin tổ chức ── */}
            {activeTab === "profileDetail" && (
                <div className="space-y-6">
                    <Section icon={<FiUser />} title="Thông tin cơ bản">
                        <div className="flex gap-8 items-start">

                            {/* Cột trái — Logo */}
                            <div className="flex flex-col items-center gap-3 shrink-0">
                                <div className="relative">
                                    <div
                                        onClick={() => logoPreview && setViewingLogo(true)}
                                        className={`w-40 h-40 rounded-2xl overflow-hidden flex items-center justify-center
                                            border-2 border-dashed border-white/20 bg-white/5
                                            ${logoPreview ? "cursor-zoom-in hover:border-primary/60 border-solid" : "cursor-default"}
                                            transition-all duration-300`}
                                    >
                                        {logoPreview
                                            ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                            : (
                                                <div className="flex flex-col items-center gap-2 text-slate-600">
                                                    <FiCamera size={32} />
                                                    <span className="text-xs text-center px-2">JPG, PNG hoặc SVG</span>
                                                </div>
                                            )
                                        }
                                    </div>

                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary border-4 border-[#140f2a] flex items-center justify-center shadow-xl hover:bg-primary/80 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <FiCamera size={13} className="text-white" />
                                    </button>

                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoChange}
                                    />
                                </div>

                                <div className="text-center space-y-0.5">
                                    <p className="text-xs font-semibold text-white uppercase tracking-wider">Tải lên logo</p>
                                    <p className="text-[11px] text-slate-500">JPG, PNG, WEBP · Tối đa 5MB</p>
                                </div>

                                {logoFile && (
                                    <p className="text-[11px] text-primary/80 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 text-center">
                                        ✓ Lưu khi nhấn "Lưu thay đổi"
                                    </p>
                                )}
                            </div>

                            {/* Cột phải — Fields */}
                            <div className="flex-1 grid grid-cols-1 gap-5">
                                <FieldInput
                                    label="Tên hiển thị"
                                    required
                                    placeholder="Công ty TNHH Acme..."
                                    maxLength={100}
                                    value={displayName}
                                    onChange={(v) => { setDisplayName(v); setProfileErrors((p) => ({ ...p, displayName: undefined })); }}
                                    error={profileErrors.displayName}
                                />

                                <div className="space-y-2">
                                    <FieldLabel required>Mô tả tổ chức</FieldLabel>
                                    <textarea
                                        placeholder="Mô tả ngắn về sứ mệnh và lĩnh vực hoạt động..."
                                        maxLength={500}
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none focus:border-primary resize-none text-sm transition"
                                    />
                                    <p className="text-xs text-slate-500 text-right">{description.length} / 500</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput
                                        label="Website / Mạng xã hội"
                                        placeholder="https://..."
                                        value={socialLink}
                                        onChange={setSocialLink}
                                        icon={<FiGlobe />}
                                    />
                                    <FieldInput
                                        label="Địa chỉ"
                                        placeholder="Nhập địa chỉ..."
                                        maxLength={200}
                                        value={address}
                                        onChange={setAddress}
                                        icon={<FiMapPin />}
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section icon={<FiFileText />} title="Thông tin pháp lý">
                        <div className="space-y-3">
                            <FieldLabel>Loại hình kinh doanh</FieldLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <RadioCard
                                    icon={<MdOutlinePerson size={18} />}
                                    label="Cá nhân"
                                    checked={businessType === "individual"}
                                    onChange={() => { setBusinessType("individual"); setProfileErrors({}); }}
                                />
                                <RadioCard
                                    icon={<MdOutlineBusiness size={18} />}
                                    label="Công ty / Doanh nghiệp"
                                    checked={businessType === "company"}
                                    onChange={() => { setBusinessType("company"); setProfileErrors({}); }}
                                />
                            </div>
                        </div>

                        {businessType === "individual" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldInput
                                    label="Số CMND / CCCD"
                                    required
                                    placeholder="9 hoặc 12 chữ số"
                                    onlyNumber
                                    value={identityNumber}
                                    onChange={(v) => { setIdentityNumber(v); setProfileErrors((p) => ({ ...p, identityNumber: undefined })); }}
                                    error={profileErrors.identityNumber}
                                />
                                <FieldInput
                                    label="Mã số thuế cá nhân"
                                    required
                                    placeholder="10 hoặc 13 chữ số"
                                    onlyNumber
                                    value={taxCode}
                                    onChange={(v) => { setTaxCode(v); setProfileErrors((p) => ({ ...p, taxCode: undefined })); }}
                                    error={profileErrors.taxCode}
                                />
                            </div>
                        )}

                        {businessType === "company" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FieldInput
                                    label="Tên công ty"
                                    required
                                    placeholder="Nhập tên công ty..."
                                    maxLength={200}
                                    value={companyName}
                                    onChange={(v) => { setCompanyName(v); setProfileErrors((p) => ({ ...p, companyName: undefined })); }}
                                    error={profileErrors.companyName}
                                />
                                <FieldInput
                                    label="Mã số thuế"
                                    required
                                    placeholder="10 hoặc 13 chữ số"
                                    onlyNumber
                                    value={taxCode}
                                    onChange={(v) => { setTaxCode(v); setProfileErrors((p) => ({ ...p, taxCode: undefined })); }}
                                    error={profileErrors.taxCode}
                                />
                                <div className="md:col-span-2">
                                    <FieldInput
                                        label="Số CMND / CCCD người đại diện (Không bắt buộc)"
                                        placeholder="Số CMND / CCCD"
                                        onlyNumber
                                        value={identityNumber}
                                        onChange={(v) => { setIdentityNumber(v); setProfileErrors((p) => ({ ...p, identityNumber: undefined })); }}
                                        error={profileErrors.identityNumber}
                                    />
                                </div>
                            </div>
                        )}
                    </Section>

                    <div className="flex justify-end">
                        <SaveButton loading={profileLoading} onClick={handleSaveProfile} label="Lưu thay đổi" />
                    </div>
                </div>
            )}

            {/* ── Tab: Tài khoản ngân hàng ── */}
            {activeTab === "bank" && (
                <div className="space-y-6">
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-slate-300 leading-relaxed">
                        <p className="font-semibold text-white mb-1">Lưu ý</p>
                        Tiền bán vé (sau khi trừ phí dịch vụ) sẽ vào tài khoản của bạn sau khi xác nhận
                        sale report từ <b className="text-white">7 – 10 ngày</b>. Liên hệ{" "}
                        <b className="text-white">1900.6408</b> hoặc{" "}
                        <b className="text-white">info@ticketbox.vn</b> để nhận tiền sớm hơn.
                    </div>

                    <Section icon={<FiCreditCard />} title="Thông tin tài khoản">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldInput
                                label="Chủ tài khoản"
                                required
                                placeholder="NGUYEN VAN A"
                                maxLength={100}
                                uppercase
                                noAccent
                                onlyLetter
                                value={accountName}
                                onChange={(v) => { setAccountName(v); setBankErrors((p) => ({ ...p, accountName: undefined })); }}
                                error={bankErrors.accountName}
                            />
                            <FieldInput
                                label="Số tài khoản"
                                required
                                placeholder="Nhập số tài khoản"
                                onlyNumber
                                value={accountNumber}
                                onChange={(v) => { setAccountNumber(v); setBankErrors((p) => ({ ...p, accountNumber: undefined })); }}
                                error={bankErrors.accountNumber}
                            />
                            <div className="space-y-2">
                                <BankSelect
                                    label="Tên ngân hàng"
                                    required
                                    banks={BANKS}
                                    value={bankCode}
                                    onChange={(v) => { setBankCode(v); setBankErrors((p) => ({ ...p, bankCode: undefined })); }}
                                    error={!!bankErrors.bankCode}
                                />
                                {bankErrors.bankCode && (
                                    <p className="text-xs text-red-400">{bankErrors.bankCode}</p>
                                )}
                            </div>
                            <FieldInput
                                label="Chi nhánh"
                                required
                                placeholder="Nhập tên chi nhánh"
                                maxLength={100}
                                value={branch}
                                onChange={(v) => { setBranch(v); setBankErrors((p) => ({ ...p, branch: undefined })); }}
                                error={bankErrors.branch}
                            />
                        </div>
                    </Section>

                    <div className="flex justify-end">
                        <SaveButton loading={bankLoading} onClick={handleSaveBank} label="Lưu tài khoản" />
                    </div>
                </div>
            )}

            {viewingLogo && logoPreview && (
                <ImageViewer url={logoPreview} onClose={() => setViewingLogo(false)} />
            )}

            <ConfirmModal
                open={confirmOpen}
                title="Xác nhận cập nhật hồ sơ"
                description={
                    <span>
                        Sau khi lưu, hồ sơ của bạn sẽ được chuyển sang trạng thái{" "}
                        <span className="font-semibold text-yellow-400">Đang kiểm duyệt</span>.
                        <br /><br />
                        Bạn chỉ có thể đăng sự kiện <span className="font-semibold text-white">public</span> khi
                        hồ sơ được kiểm duyệt và phê duyệt thành công.
                    </span>
                }
                confirmText="Xác nhận lưu"
                cancelText="Huỷ"
                loading={profileLoading || bankLoading}
                onConfirm={handleConfirm}
                onCancel={handleCancelConfirm}
            />
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-primary">{icon}</span>
                {title}
            </h2>
            {children}
        </div>
    );
}

function RadioCard({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all duration-200 ${checked ? "border-primary bg-primary/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-primary/40 hover:text-white"}`}>
            <input type="radio" checked={checked} onChange={onChange} className="hidden" />
            <span className={checked ? "text-primary" : ""}>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            {checked && <span className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center"><FiCheck size={10} className="text-white" /></span>}
        </label>
    );
}

function SaveButton({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
    return (
        <button onClick={onClick} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-primary/20">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiCheck size={15} />}
            {loading ? "Đang lưu..." : label}
        </button>
    );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {children}
            {required && <span className="text-red-500"> *</span>}
        </label>
    );
}

function FieldInput({ label, required, placeholder, maxLength, uppercase, noAccent, onlyNumber, onlyLetter, value, onChange, error, icon }: {
    label: string; required?: boolean; placeholder: string; maxLength?: number;
    uppercase?: boolean; noAccent?: boolean; onlyNumber?: boolean; onlyLetter?: boolean;
    value: string; onChange: (val: string) => void; error?: string; icon?: React.ReactNode;
}) {
    function normalize(raw: string) {
        let v = raw;
        if (noAccent) v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
        if (onlyNumber) v = v.replace(/[^0-9]/g, "");
        if (onlyLetter) v = v.replace(/[^a-zA-Z\s]/g, "");
        if (uppercase) v = v.toUpperCase();
        return v;
    }
    return (
        <div className="space-y-2">
            <FieldLabel required={required}>{label}</FieldLabel>
            <div className="relative">
                {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">{icon}</span>}
                <input
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={value}
                    onChange={(e) => onChange(normalize(e.target.value))}
                    className={`w-full py-3 rounded-xl bg-black/30 border text-white outline-none focus:border-primary transition text-sm ${error ? "border-red-500" : "border-white/10"} ${icon ? "pl-9" : "pl-4"} ${maxLength ? "pr-[52px]" : "pr-4"} ${uppercase ? "uppercase" : ""}`}
                />
                {maxLength && <span className="absolute right-3 top-3.5 text-[10px] text-slate-500">{value.length}/{maxLength}</span>}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}