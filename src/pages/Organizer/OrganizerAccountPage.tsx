import { useEffect, useState } from "react";
import { FiCheck, FiCreditCard, FiGlobe, FiMapPin, FiFileText, FiUser } from "react-icons/fi";
import { MdOutlineBusiness, MdOutlinePerson } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchOrganizerProfile,
    fetchUpdateOrganizerBank,
    fetchUpdateOrganizerProfile,
} from "../../store/organizerProfileSlice";
import { notify } from "../../utils/notify";
import BankSelect from "../../components/Organizer/bank/BankSelect";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";

const BANKS = [
    { code: "VCB", name: "Vietcombank" },
    { code: "VTB", name: "VietinBank" },
    { code: "BIDV", name: "BIDV" },
    { code: "AGRIBANK", name: "Agribank" },
    { code: "TCB", name: "Techcombank" },
    { code: "ACB", name: "ACB" },
    { code: "MB", name: "MB Bank" },
    { code: "VPB", name: "VPBank" },
    { code: "TPB", name: "TPBank" },
    { code: "STB", name: "Sacombank" },
    { code: "VIB", name: "VIB" },
    { code: "MSB", name: "MSB" },
    { code: "SHB", name: "SHB" },
    { code: "OCB", name: "OCB" },
];

type Tab = "profile" | "bank";
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
    const profile = useSelector((state: RootState) => state.ORGANIZER_PROFILE.profile);
    const { setConfig } = useOutletContext<DashboardContext>();

    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Profile fields
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

    // Bank fields
    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [branch, setBranch] = useState("");
    const [bankErrors, setBankErrors] = useState<BankErrors>({});
    const [bankLoading, setBankLoading] = useState(false);

    useEffect(() => {
        setConfig({ title: "Quản lý tài khoản" });
        return () => setConfig({});
    }, []);

    useEffect(() => {
        dispatch(fetchOrganizerProfile());
    }, [dispatch]);

    useEffect(() => {
        if (!profile) return;
        setDisplayName(profile.displayName ?? "");
        setDescription(profile.description ?? "");
        setSocialLink(profile.socialLink ?? "");
        setAddress(profile.address ?? "");
        setBusinessType(
            (profile.businessType?.toLowerCase() as BusinessType) ?? "individual"
        );
        setCompanyName(profile.companyName ?? "");
        setTaxCode(profile.taxCode ?? "");
        setIdentityNumber(profile.identityNumber ?? "");
        setBankCode(profile.bankCode ?? "");
        setAccountName(profile.accountName ?? "");
        setAccountNumber(profile.accountNumber ?? "");
        setBranch(profile.branch ?? "");
    }, [profile]);

    const validateProfile = (): boolean => {
        const errors: ProfileErrors = {};
        if (!displayName.trim())
            errors.displayName = "Tên hiển thị không được để trống";
        if (businessType === "individual") {
            if (identityNumber && !/^\d{9}$|^\d{12}$/.test(identityNumber))
                errors.identityNumber = "Số CMND / CCCD phải có 9 hoặc 12 chữ số";
        }
        if (businessType === "company") {
            if (!companyName.trim())
                errors.companyName = "Tên công ty không được để trống";
            if (!taxCode.trim())
                errors.taxCode = "Mã số thuế không được để trống";
            else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(taxCode))
                errors.taxCode = "Mã số thuế không hợp lệ (10 hoặc 13 chữ số)";
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

    const handleSaveProfile = async () => {
        if (!validateProfile()) return;
        setProfileLoading(true);
        try {
            const result = await dispatch(
                fetchUpdateOrganizerProfile({
                    logo: profile?.logo ?? "",
                    displayName,
                    description,
                    socialLink,
                    address,
                    businessType,
                    companyName: businessType === "company" ? companyName : "",
                    taxCode: businessType === "company" ? taxCode : "",
                    identityNumber,
                })
            );
            if (fetchUpdateOrganizerProfile.rejected.match(result)) {
                notify.error("Không thể cập nhật thông tin");
            } else {
                notify.success("Cập nhật thông tin thành công");
                dispatch(fetchOrganizerProfile());
            }
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSaveBank = async () => {
        if (!validateBank()) return;
        setBankLoading(true);
        try {
            const result = await dispatch(
                fetchUpdateOrganizerBank({ accountName, accountNumber, bankCode, branch })
            );
            if (fetchUpdateOrganizerBank.rejected.match(result)) {
                notify.error("Không thể cập nhật tài khoản ngân hàng");
            } else {
                notify.success("Cập nhật tài khoản ngân hàng thành công");
                dispatch(fetchOrganizerProfile());
            }
        } finally {
            setBankLoading(false);
        }
    };

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "profile", label: "Thông tin tổ chức", icon: <MdOutlineBusiness /> },
        { key: "bank", label: "Tài khoản ngân hàng", icon: <FiCreditCard /> },
    ];

    return (
        <div className="space-y-6 mx-auto">

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
            {activeTab === "profile" && (
                <div className="space-y-6">

                    {/* Thông tin cơ bản */}
                    <Section icon={<FiUser />} title="Thông tin cơ bản">
                        <div className="grid grid-cols-1 gap-6">
                            <FieldInput
                                label="Tên hiển thị"
                                required
                                placeholder="Tên tổ chức hoặc ban nhạc..."
                                maxLength={100}
                                value={displayName}
                                onChange={(v) => { setDisplayName(v); setProfileErrors((p) => ({ ...p, displayName: undefined })); }}
                                error={profileErrors.displayName}
                            />

                            <div className="space-y-2">
                                <FieldLabel>Mô tả</FieldLabel>
                                <textarea
                                    placeholder="Giới thiệu về tổ chức của bạn..."
                                    maxLength={500}
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none focus:border-primary resize-none text-sm transition"
                                />
                                <p className="text-xs text-slate-500 text-right">{description.length} / 500</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </Section>

                    {/* Thông tin pháp lý */}
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
                            <FieldInput
                                label="Số CMND / CCCD"
                                placeholder="9 hoặc 12 chữ số"
                                onlyNumber
                                value={identityNumber}
                                onChange={(v) => { setIdentityNumber(v); setProfileErrors((p) => ({ ...p, identityNumber: undefined })); }}
                                error={profileErrors.identityNumber}
                            />
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
                                        label="CMND / CCCD người đại diện"
                                        placeholder="(Không bắt buộc)"
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

function RadioCard({
    icon, label, checked, onChange,
}: {
    icon: React.ReactNode; label: string; checked: boolean; onChange: () => void;
}) {
    return (
        <label className={`
            flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all duration-200
            ${checked
                ? "border-primary bg-primary/10 text-white"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-primary/40 hover:text-white"
            }
        `}>
            <input type="radio" checked={checked} onChange={onChange} className="hidden" />
            <span className={checked ? "text-primary" : ""}>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            {checked && (
                <span className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <FiCheck size={10} className="text-white" />
                </span>
            )}
        </label>
    );
}

function SaveButton({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-primary/20"
        >
            {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiCheck size={15} />
            }
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

function FieldInput({
    label, required, placeholder, maxLength, uppercase, noAccent,
    onlyNumber, onlyLetter, value, onChange, error, icon,
}: {
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
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
                        {icon}
                    </span>
                )}
                <input
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={value}
                    onChange={(e) => onChange(normalize(e.target.value))}
                    className={`
                        w-full py-3 rounded-xl bg-black/30 border text-white outline-none
                        focus:border-primary transition text-sm
                        ${error ? "border-red-500" : "border-white/10"}
                        ${icon ? "pl-9" : "pl-4"}
                        ${maxLength ? "pr-[52px]" : "pr-4"}
                        ${uppercase ? "uppercase" : ""}
                    `}
                />
                {maxLength && (
                    <span className="absolute right-3 top-3.5 text-[10px] text-slate-500">
                        {value.length}/{maxLength}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}