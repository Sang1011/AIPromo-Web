import { FiInfo, FiCreditCard, FiFileText } from "react-icons/fi";
import BankSelect from "../bank/BankSelect";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import {
    fetchOrganizerProfile,
    fetchUpdateOrganizerBank,
    fetchUpdateOrganizerProfile,
} from "../../../store/organizerProfileSlice";
import { notify } from "../../../utils/notify";

interface Step5PaymentProps {
    onBack?: () => void;
    onFinish?: () => void;
}

interface BankErrors {
    accountName?: string;
    accountNumber?: string;
    bankCode?: string;
    branch?: string;
}

interface VatErrors {
    companyName?: string;
    address?: string;
    taxCode?: string;
    identityNumber?: string;
}

export default function Step5Payment({ onBack, onFinish }: Step5PaymentProps) {
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

    const dispatch = useDispatch<AppDispatch>();
    const profile = useSelector((state: RootState) => state.ORGANIZER_PROFILE.profile);

    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [branch, setBranch] = useState("");

    const [businessType, setBusinessType] = useState<"personal" | "company">("personal");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [identityNumber, setIdentityNumber] = useState("");

    const [bankErrors, setBankErrors] = useState<BankErrors>({});
    const [vatErrors, setVatErrors] = useState<VatErrors>({});

    useEffect(() => {
        dispatch(fetchOrganizerProfile());
    }, [dispatch]);

    useEffect(() => {
        if (!profile) return;
        setBankCode(profile.bankCode ?? "");
        setAccountName(profile.accountName ?? "");
        setAccountNumber(profile.accountNumber ?? "");
        setBranch(profile.branch ?? "");
        setBusinessType((profile.businessType as "personal" | "company") ?? "personal");
        setCompanyName(profile.companyName ?? "");
        setAddress(profile.address ?? "");
        setTaxCode(profile.taxCode ?? "");
        setIdentityNumber(profile.identityNumber ?? "");
    }, [profile]);

    const validateBank = (): boolean => {
        const errors: BankErrors = {};

        if (!accountName.trim())
            errors.accountName = "Chủ tài khoản không được để trống";

        if (!accountNumber.trim())
            errors.accountNumber = "Số tài khoản không được để trống";
        else if (!/^\d{6,20}$/.test(accountNumber))
            errors.accountNumber = "Số tài khoản phải từ 6 đến 20 chữ số";

        if (!bankCode)
            errors.bankCode = "Vui lòng chọn ngân hàng";

        if (!branch.trim())
            errors.branch = "Chi nhánh không được để trống";

        setBankErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateVat = (): boolean => {
        const errors: VatErrors = {};

        if (!companyName.trim())
            errors.companyName = businessType === "personal"
                ? "Họ và tên không được để trống"
                : "Tên công ty không được để trống";

        if (!address.trim())
            errors.address = "Địa chỉ không được để trống";

        if (businessType === "personal") {
            if (!identityNumber.trim())
                errors.identityNumber = "Số CMND / CCCD không được để trống";
            else if (!/^\d{9}$|^\d{12}$/.test(identityNumber))
                errors.identityNumber = "Số CMND / CCCD phải có 9 hoặc 12 chữ số";
        }

        if (businessType === "company") {
            if (!taxCode.trim())
                errors.taxCode = "Mã số thuế không được để trống";
            else if (!/^[0-9]{10}(-[0-9]{3})?$/.test(taxCode))
                errors.taxCode = "Mã số thuế không hợp lệ (10 hoặc 13 ký tự số)";

            if (identityNumber && !/^\d{9}$|^\d{12}$/.test(identityNumber))
                errors.identityNumber = "Số CMND / CCCD phải có 9 hoặc 12 chữ số";
        }

        setVatErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFinish = async () => {
        const bankValid = validateBank();
        // const vatValid = validateVat();
        if (!bankValid) return;

        const bankResult = await dispatch(
            fetchUpdateOrganizerBank({ accountName, accountNumber, bankCode, branch })
        );

        if (fetchUpdateOrganizerBank.rejected.match(bankResult)) {
            notify.error("Không thể cập nhật tài khoản ngân hàng");
            return;
        }

        // const profileResult = await dispatch(
        //     fetchUpdateOrganizerProfile({
        //         logo: profile?.logo ?? "",
        //         displayName: profile?.displayName ?? "",
        //         description: profile?.description ?? "",
        //         socialLink: profile?.socialLink ?? "",
        //         businessType,
        //         companyName,
        //         address,
        //         taxCode,
        //         identityNumber,
        //     })
        // );

        // if (fetchUpdateOrganizerProfile.rejected.match(profileResult)) {
        //     notify.error("Không thể cập nhật thông tin hoá đơn");
        //     return;
        // }

        notify.success("Đã lưu thông tin thanh toán");
        onFinish?.();
    };

    return (
        <div className="space-y-8">
            <div className="rounded-2xl bg-primary/10 border border-primary/30 p-5 flex gap-4">
                <div className="text-primary mt-1">
                    <FiInfo />
                </div>
                <div className="text-sm text-slate-300 leading-relaxed">
                    <p className="font-semibold text-white mb-1">Thông tin thanh toán</p>
                    Ticketbox sẽ chuyển tiền bán vé đến tài khoản của bạn.
                    Tiền bán vé (sau khi trừ phí dịch vụ) sẽ vào tài khoản của bạn
                    sau khi xác nhận sale report từ <b>7 – 10 ngày</b>.
                    Nếu bạn muốn nhận tiền sớm hơn, vui lòng liên hệ
                    <b> 1900.6408 </b> hoặc <b>info@ticketbox.vn</b>.
                </div>
            </div>

            <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                    <span className="text-primary"><FiCreditCard /></span>
                    Tài khoản ngân hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Chủ tài khoản"
                        required
                        placeholder="Nhập tên chủ tài khoản"
                        maxLength={100}
                        uppercase
                        noAccent
                        onlyLetter
                        value={accountName}
                        onChange={(v) => { setAccountName(v); setBankErrors((p) => ({ ...p, accountName: undefined })); }}
                        error={bankErrors.accountName}
                    />

                    <Input
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
                        {bankErrors.bankCode && <p className="text-xs text-red-400">{bankErrors.bankCode}</p>}
                    </div>

                    <Input
                        label="Chi nhánh"
                        required
                        placeholder="Nhập tên chi nhánh"
                        maxLength={100}
                        value={branch}
                        onChange={(v) => { setBranch(v); setBankErrors((p) => ({ ...p, branch: undefined })); }}
                        error={bankErrors.branch}
                    />
                </div>
            </section>

            {/* <section className="rounded-2xl bg-gradient-to-b from-[#140f2a] to-[#0b0816] border border-white/5 p-6 space-y-6">
                <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
                    <span className="text-primary"><FiFileText /></span>
                    Thông tin hoá đơn đỏ (VAT)
                </h2>

                <div>
                    <Label required>Loại hình kinh doanh</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <RadioCard
                            label="Cá nhân"
                            value="personal"
                            checked={businessType === "personal"}
                            onChange={() => { setBusinessType("personal"); setVatErrors({}); }}
                        />
                        <RadioCard
                            label="Công ty"
                            value="company"
                            checked={businessType === "company"}
                            onChange={() => { setBusinessType("company"); setVatErrors({}); }}
                        />
                    </div>
                </div>

                {businessType === "personal" && (
                    <div className="space-y-6">
                        <Input
                            label="Họ và tên"
                            required
                            placeholder="Nhập họ tên cá nhân"
                            maxLength={100}
                            value={companyName}
                            onChange={(v) => { setCompanyName(v); setVatErrors((p) => ({ ...p, companyName: undefined })); }}
                            error={vatErrors.companyName}
                        />

                        <Input
                            label="Địa chỉ thường trú"
                            required
                            placeholder="Nhập địa chỉ"
                            maxLength={100}
                            value={address}
                            onChange={(v) => { setAddress(v); setVatErrors((p) => ({ ...p, address: undefined })); }}
                            error={vatErrors.address}
                        />

                        <Input
                            label="Số CMND / CCCD"
                            required
                            placeholder="Nhập số CMND / CCCD"
                            onlyNumber
                            value={identityNumber}
                            onChange={(v) => { setIdentityNumber(v); setVatErrors((p) => ({ ...p, identityNumber: undefined })); }}
                            error={vatErrors.identityNumber}
                        />
                    </div>
                )}

                {businessType === "company" && (
                    <div className="space-y-6">
                        <Input
                            label="Tên công ty"
                            required
                            placeholder="Nhập tên công ty"
                            maxLength={100}
                            value={companyName}
                            onChange={(v) => { setCompanyName(v); setVatErrors((p) => ({ ...p, companyName: undefined })); }}
                            error={vatErrors.companyName}
                        />

                        <Input
                            label="Địa chỉ đăng ký thuế"
                            required
                            placeholder="Nhập địa chỉ công ty"
                            maxLength={100}
                            value={address}
                            onChange={(v) => { setAddress(v); setVatErrors((p) => ({ ...p, address: undefined })); }}
                            error={vatErrors.address}
                        />

                        <Input
                            label="Mã số thuế"
                            required
                            placeholder="Nhập mã số thuế"
                            alphanumeric
                            value={taxCode}
                            onChange={(v) => { setTaxCode(v); setVatErrors((p) => ({ ...p, taxCode: undefined })); }}
                            error={vatErrors.taxCode}
                        />

                        <Input
                            label="CMND / CCCD người đại diện"
                            placeholder="(Không bắt buộc)"
                            onlyNumber
                            value={identityNumber}
                            onChange={(v) => { setIdentityNumber(v); setVatErrors((p) => ({ ...p, identityNumber: undefined })); }}
                            error={vatErrors.identityNumber}
                        />
                    </div>
                )}
            </section> */}

            <div className="flex items-center justify-between pt-6 pb-10">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border border-primary text-primary hover:border-white hover:text-white"
                >
                    Quay lại
                </button>
                <button
                    onClick={handleFinish}
                    className="px-8 py-4 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition"
                >
                    Hoàn tất
                </button>
            </div>
        </div>
    );
}

function Input({
    label,
    required,
    placeholder,
    maxLength,
    uppercase,
    noAccent,
    onlyNumber,
    onlyLetter,
    alphanumeric,
    value,
    onChange,
    error,
}: {
    label: string
    required?: boolean
    placeholder: string
    maxLength?: number
    uppercase?: boolean
    noAccent?: boolean
    onlyNumber?: boolean
    onlyLetter?: boolean
    alphanumeric?: boolean
    value: string
    onChange: (val: string) => void
    error?: string
}) {
    function normalizeInput(raw: string) {
        let v = raw;
        if (noAccent) {
            v = v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
        }
        if (onlyNumber) v = v.replace(/[^0-9]/g, "");
        if (onlyLetter) v = v.replace(/[^a-zA-Z\s]/g, "");
        if (alphanumeric) v = v.replace(/[^a-zA-Z0-9\s]/g, "");
        if (uppercase) v = v.toUpperCase();
        return v;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(normalizeInput(e.target.value));
    };

    return (
        <div className="space-y-2">
            <Label required={required}>{label}</Label>
            <div className="relative">
                <input
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={value}
                    onChange={handleChange}
                    className={`
                        w-full px-4 py-3 rounded-xl
                        bg-black/30 border
                        text-white outline-none
                        focus:border-primary
                        ${error ? "border-red-500" : "border-white/10"}
                        ${maxLength ? "pr-[50px]" : ""}
                        ${uppercase ? "uppercase" : ""}
                    `}
                />
                {maxLength && (
                    <span className="absolute right-3 top-3 text-[10px] text-slate-500">
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {children}
            {required && <span className="text-red-500"> *</span>}
        </label>
    );
}

function RadioCard({
    label,
    value,
    checked,
    onChange,
}: {
    label: string
    value: string
    checked: boolean
    onChange: () => void
}) {
    return (
        <label
            className={`
                flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition
                ${checked ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:border-primary/40"}
            `}
        >
            <input
                type="radio"
                name="business_type"
                value={value}
                checked={checked}
                onChange={onChange}
                className="accent-primary"
            />
            <span className="text-sm font-medium text-white">{label}</span>
        </label>
    );
}