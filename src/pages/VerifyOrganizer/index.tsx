import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCreateProfileOrganizer, fetchVerifyProfileOrganizer } from "../../store/organizerProfileSlice";

export default function VerifyOrganizer() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    type: "Management",
    businessInfo: {
      logo: "",
      displayName: "",
      description: "",
      address: "",
      socialLink: "",
      businessType: "Company",
      taxCode: "",
      identityNumber: "",
      companyName: "",
    },
    bankInfo: {
      accountName: "",
      accountNumber: "",
      bankCode: "",
      branch: "",
    },
  });

  const updateBusinessInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value },
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateBankInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [field]: value },
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string) ?? null;
        setLogoPreview(base64);
        updateBusinessInfo("logo", base64 || "");
      };
      reader.readAsDataURL(file);
      if (errors["logo"]) setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!logoFile) newErrors["logo"] = "Vui lòng tải lên logo";
    if (!formData.businessInfo.displayName.trim()) newErrors["displayName"] = "Vui lòng nhập tên hiển thị";
    if (!formData.businessInfo.description.trim()) newErrors["description"] = "Vui lòng nhập mô tả tổ chức";
    if (!formData.businessInfo.companyName.trim()) newErrors["companyName"] = "Vui lòng nhập tên công ty";
    if (!formData.businessInfo.taxCode.trim()) newErrors["taxCode"] = "Vui lòng nhập mã số thuế";
    if (!formData.businessInfo.identityNumber.trim()) newErrors["identityNumber"] = "Vui lòng nhập số đăng ký doanh nghiệp";
    if (!formData.businessInfo.address.trim()) newErrors["address"] = "Vui lòng nhập địa chỉ trụ sở";
    if (!formData.businessInfo.socialLink.trim()) newErrors["socialLink"] = "Vui lòng nhập website";
    if (!formData.bankInfo.accountName.trim()) newErrors["accountName"] = "Vui lòng nhập chủ tài khoản";
    if (!formData.bankInfo.accountNumber.trim()) newErrors["accountNumber"] = "Vui lòng nhập số tài khoản";
    if (!formData.bankInfo.bankCode.trim()) newErrors["bankCode"] = "Vui lòng nhập mã ngân hàng";
    if (!formData.bankInfo.branch.trim()) newErrors["branch"] = "Vui lòng nhập tên chi nhánh";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    return {
      logoFile: logoFile as File,
      type: formData.type,
      logo: formData.businessInfo.logo || null,
      displayName: formData.businessInfo.displayName,
      description: formData.businessInfo.description,
      address: formData.businessInfo.address,
      socialLink: formData.businessInfo.socialLink,
      businessType: "Company",
      taxCode: formData.businessInfo.taxCode,
      identityNumber: formData.businessInfo.identityNumber,
      companyName: formData.businessInfo.companyName,
      accountName: formData.bankInfo.accountName,
      accountNumber: formData.bankInfo.accountNumber,
      bankCode: formData.bankInfo.bankCode,
      branch: formData.bankInfo.branch,
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = buildPayload();

      const createAction = await dispatch(fetchCreateProfileOrganizer(payload));

      if (fetchCreateProfileOrganizer.fulfilled.match(createAction)) {
        const verifyAction = await dispatch(fetchVerifyProfileOrganizer());

        if (fetchVerifyProfileOrganizer.fulfilled.match(verifyAction)) {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Lỗi trong quá trình đăng ký:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── shared class strings ── */
  const inputCls =
    "w-full bg-[#18122B] border border-[#1E293B] hover:border-[#334155] focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#475569] outline-none transition-all duration-200";

  const inputErrCls =
    "w-full bg-[#18122B] border border-red-500/60 hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#475569] outline-none transition-all duration-200";

  const labelCls =
    "block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569] mb-2";

  const errMsgCls = "mt-1.5 text-[11px] text-red-400 flex items-center gap-1";

  const sectionCls =
    "bg-[#18122B] border border-[#1E293B] rounded-2xl p-7 space-y-6";

  const getInputCls = (field: string) => errors[field] ? inputErrCls : inputCls;

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white font-['Space_Grotesk',sans-serif] px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="text-center mb-10 space-y-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            Xác minh tổ chức
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Đăng ký Ban tổ chức
          </h1>
          <p className="text-[#475569] text-sm max-w-md mx-auto leading-relaxed">
            Điền đầy đủ thông tin bên dưới. Hồ sơ sẽ được xét duyệt trong vòng 2–3 ngày làm việc.
          </p>
        </div>

        {/* ── 1. Branding ── */}
        <div className={sectionCls}>
          <div className="flex items-center gap-3 pb-5 border-b border-[#1E293B]">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">Bước 01</p>
              <h2 className="text-base font-bold text-white leading-tight">Nhận diện thương hiệu</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>
                Tải lên logo <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`aspect-square rounded-xl bg-[#0B0B12] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-colors duration-200 group ${errors["logo"]
                    ? "border-red-500/60 hover:border-red-400"
                    : "border-[#1E293B] hover:border-primary/40"
                  }`}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain absolute inset-0" />
                ) : (
                  <>
                    <span className={`material-symbols-outlined text-4xl mb-2 transition-colors ${errors["logo"] ? "text-red-500/60" : "text-[#334155] group-hover:text-primary/60"}`}>
                      upload_file
                    </span>
                    <span className={`text-[11px] transition-colors ${errors["logo"] ? "text-red-400" : "text-[#334155] group-hover:text-[#475569]"}`}>
                      JPG, PNG hoặc SVG
                    </span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
              {errors["logo"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["logo"]}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-5">
              <div>
                <label className={labelCls} htmlFor="display_name">
                  Tên hiển thị <span className="text-red-400">*</span>
                </label>
                <input
                  className={getInputCls("displayName")}
                  id="display_name"
                  type="text"
                  placeholder="Công ty TNHH Acme"
                  value={formData.businessInfo.displayName}
                  onChange={(e) => updateBusinessInfo("displayName", e.target.value)}
                />
                {errors["displayName"] && (
                  <p className={errMsgCls}>
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors["displayName"]}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls} htmlFor="description">
                  Mô tả tổ chức <span className="text-red-400">*</span>
                </label>
                <textarea
                  className={getInputCls("description") + " resize-none"}
                  id="description"
                  rows={4}
                  placeholder="Mô tả ngắn về sứ mệnh và lĩnh vực hoạt động..."
                  value={formData.businessInfo.description}
                  onChange={(e) => updateBusinessInfo("description", e.target.value)}
                />
                {errors["description"] && (
                  <p className={errMsgCls}>
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors["description"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Business Info ── */}
        <div className={sectionCls}>
          <div className="flex items-center gap-3 pb-5 border-b border-[#1E293B]">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">business</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">Bước 02</p>
              <h2 className="text-base font-bold text-white leading-tight">Thông tin doanh nghiệp</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls} htmlFor="company_name">
                Tên công ty (pháp lý) <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("companyName")}
                id="company_name"
                type="text"
                placeholder="Acme Global Solutions Ltd."
                value={formData.businessInfo.companyName}
                onChange={(e) => updateBusinessInfo("companyName", e.target.value)}
              />
              {errors["companyName"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["companyName"]}
                </p>
              )}
            </div>

            {/* businessType is always "Company" — shown as read-only badge */}
            <div>
              <label className={labelCls}>Loại hình doanh nghiệp</label>
              <div className={`${inputCls} flex items-center gap-2 cursor-default select-none opacity-60`}>
                <span className="material-symbols-outlined text-primary text-[16px]">apartment</span>
                <span>Company</span>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="tax_code">
                Mã số thuế (VAT / MST) <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("taxCode")}
                id="tax_code"
                type="text"
                placeholder="0123456789"
                value={formData.businessInfo.taxCode}
                onChange={(e) => updateBusinessInfo("taxCode", e.target.value)}
              />
              {errors["taxCode"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["taxCode"]}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="identity_number">
                Số đăng ký doanh nghiệp <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("identityNumber")}
                id="identity_number"
                type="text"
                placeholder="Số GPKD / Mã đăng ký"
                value={formData.businessInfo.identityNumber}
                onChange={(e) => updateBusinessInfo("identityNumber", e.target.value)}
              />
              {errors["identityNumber"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["identityNumber"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Location & Social ── */}
        <div className={sectionCls}>
          <div className="flex items-center gap-3 pb-5 border-b border-[#1E293B]">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">Bước 03</p>
              <h2 className="text-base font-bold text-white leading-tight">Địa điểm &amp; Mạng xã hội</h2>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelCls} htmlFor="address">
                Địa chỉ trụ sở chính <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("address")}
                id="address"
                type="text"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={formData.businessInfo.address}
                onChange={(e) => updateBusinessInfo("address", e.target.value)}
              />
              {errors["address"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["address"]}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="website">
                Website chính thức <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-[16px] pointer-events-none">
                  language
                </span>
                <input
                  className={`${getInputCls("socialLink")} pl-10`}
                  id="website"
                  type="url"
                  placeholder="https://example.com.vn"
                  value={formData.businessInfo.socialLink}
                  onChange={(e) => updateBusinessInfo("socialLink", e.target.value)}
                />
              </div>
              {errors["socialLink"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["socialLink"]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Banking ── */}
        <div className="bg-[#18122B] border border-[#1E293B] rounded-2xl p-7 space-y-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-5 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">Bước 04</p>
                <h2 className="text-base font-bold text-white leading-tight">Thông tin ngân hàng</h2>
              </div>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-primary/40">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              Bảo mật
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls} htmlFor="account_name">
                Chủ tài khoản <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("accountName")}
                id="account_name"
                type="text"
                placeholder="CÔNG TY TNHH ACME"
                value={formData.bankInfo.accountName}
                onChange={(e) => updateBankInfo("accountName", e.target.value)}
              />
              {errors["accountName"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["accountName"]}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="account_number">
                Số tài khoản / IBAN <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  className={`${getInputCls("accountNumber")} pr-11`}
                  id="account_number"
                  type={showAccount ? "text" : "password"}
                  placeholder="•••• •••• •••• ••••"
                  value={formData.bankInfo.accountNumber}
                  onChange={(e) => updateBankInfo("accountNumber", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowAccount(!showAccount)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showAccount ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors["accountNumber"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["accountNumber"]}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="bank_code">
                Mã ngân hàng (SWIFT / BIC) <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("bankCode")}
                id="bank_code"
                type="text"
                placeholder="Ví dụ: BIDVVNVX"
                value={formData.bankInfo.bankCode}
                onChange={(e) => updateBankInfo("bankCode", e.target.value)}
              />
              {errors["bankCode"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["bankCode"]}
                </p>
              )}
            </div>

            <div>
              <label className={labelCls} htmlFor="branch_name">
                Tên chi nhánh <span className="text-red-400">*</span>
              </label>
              <input
                className={getInputCls("branch")}
                id="branch_name"
                type="text"
                placeholder="Chi nhánh trung tâm Hà Nội"
                value={formData.bankInfo.branch}
                onChange={(e) => updateBankInfo("branch", e.target.value)}
              />
              {errors["branch"] && (
                <p className={errMsgCls}>
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors["branch"]}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">lock</span>
            <p className="text-[11px] leading-relaxed text-[#475569]">
              Thông tin ngân hàng được mã hóa đầu cuối và lưu trữ tách biệt với dữ liệu hồ sơ.
              Chúng tôi chỉ sử dụng thông tin này cho mục đích thanh toán và quyết toán tài chính
              liên quan đến hoạt động tổ chức sự kiện.
            </p>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex flex-col items-center gap-4 pt-2 pb-6">
          {Object.keys(errors).length > 0 && (
            <div className="w-full flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-red-400 text-[18px] flex-shrink-0">error</span>
              <p className="text-[12px] text-red-400">
                Vui lòng điền đầy đủ tất cả các trường bắt buộc trước khi gửi hồ sơ.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full md:w-auto flex items-center justify-center gap-2.5 px-12 py-4 bg-primary text-white font-bold text-[15px] rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90 active:scale-[0.98]"
              }`}
          >
            {isSubmitting ? "Đang xử lý hồ sơ..." : "Gửi hồ sơ xác minh"}
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </button>
          <p className="text-[12px] text-[#475569] text-center">
            Thời gian xử lý thường mất 2–3 ngày làm việc.
            Bạn sẽ nhận thông báo qua email sau khi hồ sơ được duyệt.
          </p>
        </div>

      </div>
    </div>
  );
}