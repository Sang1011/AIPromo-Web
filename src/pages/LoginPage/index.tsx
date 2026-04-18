import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../store";
import { fetchLogin, fetchLoginGoogle } from "../../store/authSlice";
import type { LoginRequest } from "../../types/auth/auth";
import "./login.css";
import logo from "../../assets/logo.svg";

const REMEMBER_ME_KEY = "aipromo_remember_me";
const SAVED_EMAIL_KEY = "aipromo_saved_email";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [_isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY) || "";
    if (savedRememberMe && savedEmail) {
      setRememberMe(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const data: LoginRequest = {
        emailOrUserName: email,
        password,
        deviceId: crypto.randomUUID(),
        deviceName: navigator.platform,
        ipAddress: "",
        userAgent: navigator.userAgent,
      };

      const res = await dispatch(fetchLogin(data));

      if (res.payload?.isSuccess) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, "true");
          localStorage.setItem(SAVED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(SAVED_EMAIL_KEY);
        }
        const roles = res.payload.data.user.roles;
        if (roles.includes("Staff")) {
          navigate("/staff/event-approval");
        } else if (roles.includes("Admin")) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(SAVED_EMAIL_KEY);
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
          style={{
            background:
              "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.8) 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10 lg:px-40 border-b border-primary/10 bg-background-dark/30 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
          <h2 className="text-xl font-bold tracking-tight">
            <Link to="/">AIPromo</Link>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-slate-300">
            Chưa có tài khoản?
          </span>
          <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-primary/20">
            <Link to="/register">Đăng ký</Link>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="glass-card w-full max-w-md p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại</h1>
            <p className="text-slate-300">
              Đăng nhập để quản lý sự kiện của bạn
            </p>
          </div>

          <div className="flex justify-center mb-[20px]">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                setError("");
                setIsGoogleLoading(true);

                const deviceName =
                  navigator.userAgent.length > 100
                    ? navigator.userAgent.substring(0, 100)
                    : navigator.userAgent;

                dispatch(
                  fetchLoginGoogle({
                    idToken: credentialResponse.credential,
                    deviceName,
                  })
                ).then((res) => {
                  setIsGoogleLoading(false);

                  if (res.payload?.isSuccess) {
                    navigate("/");
                  } else {
                    setError("Đăng nhập Google thất bại.");
                  }
                });
              }}
              onError={() => {
                setError("Đăng nhập Google thất bại.");
                setIsGoogleLoading(false);
              }}
              useOneTap={false}
              theme="filled_black"
              size="large"
              text="continue_with"
              context="use"
              logo_alignment="center"
              shape="rectangular"
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-white/20" />
            <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-slate-400">
              Hoặc sử dụng email
            </span>
            <div className="flex-grow border-t border-white/20" />
          </div>

          {/* Error */}
          {
            error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )
          }

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="block text-sm font-medium text-slate-200 mb-1.5"
                htmlFor="email"
              >
                Địa chỉ Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  mail
                </span>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                  id="email"
                  placeholder="example@aipromo.vn"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label
                  className="block text-sm font-medium text-slate-200"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 neon-focus transition-all"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
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

            <div className="flex items-center">
              <input
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background-dark"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              <label className="ml-2 text-sm text-slate-300" htmlFor="remember">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>Đăng nhập</>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-400">
              Bằng cách đăng nhập, bạn đồng ý với{" "}
              <a
                className="text-slate-200 hover:text-primary transition-colors border-b border-white/20"
                href="#"
              >
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a
                className="text-slate-200 hover:text-primary transition-colors border-b border-white/20"
                href="#"
              >
                Chính sách bảo mật
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </div >
      </main >

      <footer className="py-6 px-10 text-center text-slate-400 text-xs backdrop-blur-sm bg-background-dark/20 relative z-10">
        <p>© 2026 AIPromo Event Platform. Mọi quyền được bảo lưu.</p>
      </footer>
    </div >
  );
}

export default Login;