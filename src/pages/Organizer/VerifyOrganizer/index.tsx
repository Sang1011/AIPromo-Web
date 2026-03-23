import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCreateProfileOrganizer, fetchVerifyProfileOrganizer } from "../../../store/organizerProfileSlice";
// Hãy đảm bảo các import dưới đây đúng với cấu trúc thư mục của bạn
// import { fetchCreateProfileOrganizer, fetchVerifyProfileOrganizer } from "@/redux/slices/organizerSlice";

export default function VerifyOrganizer() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo state theo CreateProfileOrganizerRequest
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

  // Hàm cập nhật state cho từng phần
  const updateBusinessInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value },
    }));
  };

  const updateBankInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [field]: value },
    }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string) ?? null;
        setLogoPreview(base64);
        updateBusinessInfo("logo", base64 || "");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. Gọi tạo Profile
      const createAction = await dispatch(fetchCreateProfileOrganizer(formData));
      
      if (fetchCreateProfileOrganizer.fulfilled.match(createAction)) {
        // 2. Gọi xác minh Profile nếu bước 1 thành công
        const verifyAction = await dispatch(fetchVerifyProfileOrganizer());
        
        if (fetchVerifyProfileOrganizer.fulfilled.match(verifyAction)) {
          // 3. Navigate về trang chủ
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

  const labelCls =
    "block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569] mb-2";

  const sectionCls =
    "bg-[#18122B] border border-[#1E293B] rounded-2xl p-7 space-y-6";

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
              <h2 className="text-base font-700 font-bold text-white leading-tight">Nhận diện thương hiệu</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelCls}>Tải lên logo</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl bg-[#0B0B12] border-2 border-dashed border-[#1E293B] hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-colors duration-200 group"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain absolute inset-0" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[#334155] text-4xl mb-2 group-hover:text-primary/60 transition-colors">upload_file</span>
                    <span className="text-[11px] text-[#334155] group-hover:text-[#475569] transition-colors">JPG, PNG hoặc SVG</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-5">
              <div>
                <label className={labelCls} htmlFor="display_name">Tên hiển thị</label>
                <input 
                  className={inputCls} 
                  id="display_name" 
                  type="text" 
                  placeholder="Công ty TNHH Acme" 
                  value={formData.businessInfo.displayName}
                  onChange={(e) => updateBusinessInfo("displayName", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="description">Mô tả tổ chức</label>
                <textarea
                  className={inputCls + " resize-none"}
                  id="description"
                  rows={4}
                  placeholder="Mô tả ngắn về sứ mệnh và lĩnh vực hoạt động..."
                  value={formData.businessInfo.description}
                  onChange={(e) => updateBusinessInfo("description", e.target.value)}
                />
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
              <label className={labelCls} htmlFor="company_name">Tên công ty (pháp lý)</label>
              <input 
                className={inputCls} 
                id="company_name" 
                type="text" 
                placeholder="Acme Global Solutions Ltd." 
                value={formData.businessInfo.companyName}
                onChange={(e) => updateBusinessInfo("companyName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="business_type">Loại hình doanh nghiệp</label>
              <div className="relative">
                <select
                  className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  id="business_type"
                  value={formData.businessInfo.businessType}
                  onChange={(e) => updateBusinessInfo("businessType", e.target.value)}
                >
                  <option value="" disabled>-- Chọn loại hình --</option>
                  <option value="Company">Công ty cổ phần</option>
                  <option value="Company">Công ty TNHH</option>
                  <option value="Company">Tổ chức phi lợi nhuận</option>
                  <option value="Company">Công ty hợp danh</option>
                  <option value="Company">Hộ kinh doanh cá thể</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="tax_code">Mã số thuế (VAT / MST)</label>
              <input 
                className={inputCls} 
                id="tax_code" 
                type="text" 
                placeholder="0123456789" 
                value={formData.businessInfo.taxCode}
                onChange={(e) => updateBusinessInfo("taxCode", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="identity_number">Số đăng ký doanh nghiệp</label>
              <input 
                className={inputCls} 
                id="identity_number" 
                type="text" 
                placeholder="Số GPKD / Mã đăng ký" 
                value={formData.businessInfo.identityNumber}
                onChange={(e) => updateBusinessInfo("identityNumber", e.target.value)}
              />
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
              <label className={labelCls} htmlFor="address">Địa chỉ trụ sở chính</label>
              <input
                className={inputCls}
                id="address"
                type="text"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={formData.businessInfo.address}
                onChange={(e) => updateBusinessInfo("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls} htmlFor="website">Website chính thức</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-[16px] pointer-events-none">
                    language
                  </span>
                  <input 
                    className={inputCls + " pl-10"} 
                    id="website" 
                    type="url" 
                    placeholder="https://example.com.vn" 
                    // Ở đây tôi dùng chung socialLink cho Website nếu bạn không có trường riêng trong Request
                    value={formData.businessInfo.socialLink}
                    onChange={(e) => updateBusinessInfo("socialLink", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="linkedin">LinkedIn</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-[16px] pointer-events-none">
                    link
                  </span>
                  <input className={inputCls + " pl-10"} id="linkedin" type="url" placeholder="linkedin.com/company/ten-cong-ty" />
                </div>
              </div>
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
              <label className={labelCls} htmlFor="account_name">Chủ tài khoản</label>
              <input 
                className={inputCls} 
                id="account_name" 
                type="text" 
                placeholder="CÔNG TY TNHH ACME" 
                value={formData.bankInfo.accountName}
                onChange={(e) => updateBankInfo("accountName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="account_number">Số tài khoản / IBAN</label>
              <div className="relative">
                <input
                  className={inputCls + " pr-11"}
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
            </div>
            <div>
              <label className={labelCls} htmlFor="bank_code">Mã ngân hàng (SWIFT / BIC)</label>
              <input 
                className={inputCls} 
                id="bank_code" 
                type="text" 
                placeholder="Ví dụ: BIDVVNVX" 
                value={formData.bankInfo.bankCode}
                onChange={(e) => updateBankInfo("bankCode", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="branch_name">Tên chi nhánh</label>
              <input 
                className={inputCls} 
                id="branch_name" 
                type="text" 
                placeholder="Chi nhánh trung tâm Hà Nội" 
                value={formData.bankInfo.branch}
                onChange={(e) => updateBankInfo("branch", e.target.value)}
              />
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
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full md:w-auto flex items-center justify-center gap-2.5 px-12 py-4 bg-primary text-white font-bold text-[15px] rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 active:scale-[0.98]'}`}
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