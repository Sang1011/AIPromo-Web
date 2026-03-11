import { useState } from "react";
import "./forgotpassword.css";
import { useNavigate } from "react-router-dom";

type Step = "email" | "reset";

const BG_IMAGE = "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const navigate = useNavigate();

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpCode];
    next[index] = value.slice(-1);
    setOtpCode(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpCode(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
    e.preventDefault();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Vui lòng nhập địa chỉ email."); return; }
    setIsLoading(true);
    try {
      const res = await fetch("https://localhost:7000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess("Mã OTP đã được gửi đến email của bạn.");
        setStep("reset");
      } else {
        const data = await res.json();
        setError(data.detail || "Gửi email thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const otp = otpCode.join("");
    if (otp.length < 6) { setError("Vui lòng nhập đủ 6 chữ số OTP."); return; }
    if (!newPassword) { setError("Vui lòng nhập mật khẩu mới."); return; }
    if (newPassword.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    if (newPassword !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    setIsLoading(true);
    try {
      const res = await fetch("https://localhost:7000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });
      if (res.ok) {
        setSuccess("Đặt lại mật khẩu thành công!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const data = await res.json();
        setError(data.detail || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black">

      {/* ── Left: Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={BG_IMAGE}
          alt="Concert"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Logo top-left */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <div className="text-primary">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AIPromo</span>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Nền tảng sự kiện</p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Quản lý sự kiện<br />thông minh hơn
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Tạo, quản lý và theo dõi sự kiện của bạn với sức mạnh của AI.
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background-dark">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 48 48">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">AIPromo</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-12 lg:px-16 xl:px-20">

          {/* Back button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-10 w-fit"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Quay lại đăng nhập
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === "email" ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}>
                {step === "reset" ? <span className="material-symbols-outlined text-sm">check</span> : "1"}
              </div>
              <span className={`text-sm ${step === "email" ? "text-white font-medium" : "text-slate-400"}`}>
                Xác nhận email
              </span>
            </div>
            <div className={`h-px flex-1 max-w-[40px] transition-all ${step === "reset" ? "bg-primary" : "bg-white/10"}`} />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === "reset" ? "bg-primary text-white" : "bg-white/10 text-slate-500"}`}>
                2
              </div>
              <span className={`text-sm ${step === "reset" ? "text-white font-medium" : "text-slate-500"}`}>
                Đặt lại mật khẩu
              </span>
            </div>
          </div>

          {/* ── STEP 1 ── */}
          {step === "email" && (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-primary text-xl">lock_reset</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">Địa chỉ Email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail</span>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                      placeholder="example@aipromo.vn"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Gửi mã OTP
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === "reset" && (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-primary text-xl">password</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
                <p className="text-slate-400 text-sm">
                  Nhập mã OTP đã gửi đến{" "}
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              {success && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* OTP */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-3">Mã OTP (6 chữ số)</label>
                  <div className="flex gap-2" onPaste={handleOtpPaste}>
                    {otpCode.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isLoading}
                        className="flex-1 h-12 text-center text-lg font-bold bg-white/5 border border-white/10 rounded-lg text-white neon-focus transition-all focus:border-primary/60 focus:bg-white/10 disabled:opacity-50"
                      />
                    ))}
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">Mật khẩu mới</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock</span>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder:text-slate-500 neon-focus transition-all"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                      <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_reset</span>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder:text-slate-500 neon-focus transition-all"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                      <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setError(""); setSuccess(""); setOtpCode(["","","","","",""]); }}
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-all text-sm disabled:opacity-50"
                  >
                    Gửi lại OTP
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">check</span>
                        Xác nhận
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <footer className="py-5 px-8 text-center text-slate-600 text-xs border-t border-white/5">
          © 2026 AIPromo Event Platform. Mọi quyền được bảo lưu.
        </footer>
      </div>
    </div>
  );
}

export default ForgotPassword;