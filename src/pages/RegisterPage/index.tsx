import { useState } from "react";
import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterRequest } from "../../types/auth/auth";
import { useDispatch } from "react-redux";
import { fetchRegister } from "../../store/authSlice";
import type { AppDispatch } from "../../store";
import logo from "../../assets/logo.svg";

function Register() {
    const [form, setForm] = useState<RegisterRequest>({
        email: "",
        userName: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
    });
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.userName || !form.password || !form.firstName || !form.lastName) {
            setError("Vui lòng nhập đầy đủ các trường bắt buộc.");
            return;
        }

        if (form.password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (form.password.length < 8) {
            setError("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }

        setIsLoading(true);
        try {
            dispatch(fetchRegister(form)).then((res) => {
                if (res.payload.isSuccess) {
                    navigate("/login");
                } else {
                    setError("Đăng ký thất bại. Vui lòng thử lại.");
                }
            });
            await new Promise<void>((res) => setTimeout(res, 1200));

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Đăng ký thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col z-10">
            {/* Background video */}
            <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none bg-black">
                <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2">
                    <iframe
                        className="w-full h-full scale-[1.15]"
                        src="https://www.youtube.com/embed/eTD0WWFIDAg?autoplay=1&mute=1&loop=1&playlist=eTD0WWFIDAg&controls=0&showinfo=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1"
                        allow="autoplay; fullscreen"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 100%)" }}
                />
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-40 border-b border-primary/10 bg-background-dark/30 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="text-primary">
                        <img src={logo} alt="Logo" className="h-16 w-auto" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight"><Link to="/">AIPromo</Link> </h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm text-slate-300">Đã có tài khoản?</span>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-primary/20"
                    >
                        Đăng nhập
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center p-6 relative z-10 py-10">
                <div className="glass-card w-full max-w-lg p-8 rounded-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
                        <p className="text-slate-300">Đăng ký để bắt đầu quản lý sự kiện</p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>

                        {/* Họ & Tên */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="firstName">
                                    Họ <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        person
                                    </span>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Nguyễn"
                                        type="text"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="lastName">
                                    Tên <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                        person
                                    </span>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Văn A"
                                        type="text"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="userName">
                                Tên người dùng <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    alternate_email
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="userName"
                                    name="userName"
                                    placeholder="nguyenvana"
                                    type="text"
                                    value={form.userName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="email">
                                Địa chỉ Email <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    mail
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="email"
                                    name="email"
                                    placeholder="example@aipromo.vn"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="phoneNumber">
                                Số điện thoại
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    phone
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder="0123 456 789"
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="address">
                                Địa chỉ
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    location_on
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="address"
                                    name="address"
                                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                    type="text"
                                    value={form.address}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="password">
                                Mật khẩu <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    lock
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="confirmPassword">
                                Xác nhận mật khẩu <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    lock_reset
                                </span>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder:text-slate-500 neon-focus transition-all"
                                    id="confirmPassword"
                                    placeholder="••••••••"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {showConfirmPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>Đăng ký</>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-slate-400">
                            Bằng cách đăng ký, bạn đồng ý với{" "}
                            <a
                                className="text-slate-200 hover:text-primary transition-colors border-b border-white/20"
                                href="/privacy"
                            >
                                Chính sách bảo mật
                            </a>{" "}
                            của chúng tôi.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-6 px-10 text-center text-slate-400 text-xs backdrop-blur-sm bg-background-dark/20 relative z-10">
                <p>© 2026 AIPromo Event Platform. Mọi quyền được bảo lưu.</p>
            </footer>
        </div>
    );
}

export default Register;