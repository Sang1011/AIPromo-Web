import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../store";
import { fetchLogin, fetchLoginGoogle } from "../../store/authSlice";
import type { LoginRequest } from "../../types/auth/auth";
import "./login.css";

const REMEMBER_ME_KEY = "aipromo_remember_me";
const SAVED_EMAIL_KEY = "aipromo_saved_email";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const googleWrapperRef = useRef<HTMLDivElement>(null);
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setIsGoogleLoading(true);
      console.log(tokenResponse);
      try {
        const deviceName = navigator.userAgent.length > 100
          ? navigator.userAgent.substring(0, 100)
          : navigator.userAgent;

        const res = await dispatch(
          fetchLoginGoogle({
            idToken: tokenResponse.access_token,
            deviceName,
          })
        );

        if (res.payload?.isSuccess) {
          navigate("/");
        } else {
          setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
        }
      } catch {
        setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
      setIsGoogleLoading(false);
    },
    flow: "implicit", // hoặc "auth-code" tùy backend
  });

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
          <div className="text-primary">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
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

          {/* ── Google Section ── */}
          <div className="mb-6">
            {/* GoogleLogin thật — ẩn hoàn toàn, vẫn mount để handle OAuth callback */}
            <div
              ref={googleWrapperRef}
              aria-hidden="true"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                zIndex: -1,
              }}
            >
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
                    if (res.payload?.isSuccess) {
                      navigate("/");
                    } else {
                      setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
                    }
                    setIsGoogleLoading(false);
                  });
                }}
                onError={() => {
                  setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
                  setIsGoogleLoading(false);
                }}
                useOneTap={false}
              />
            </div>

            {/* Custom Google Button */}
            <button
              type="button"
              onClick={() => handleGoogleLogin()}
              disabled={isGoogleLoading}
              className="google-custom-btn w-full relative flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Shimmer sweep */}
              <span className="google-btn-shimmer" aria-hidden="true" />

              {isGoogleLoading ? (
                <svg
                  className="animate-spin w-5 h-5 flex-shrink-0 text-white"
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
              ) : (
                /* Google "G" icon chính hãng 4 màu */
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}

              <span className="relative z-10 text-white tracking-wide">
                {isGoogleLoading ? "Đang xử lý..." : "Tiếp tục với Google"}
              </span>
            </button>
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
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

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
        </div>
      </main>

      <footer className="py-6 px-10 text-center text-slate-400 text-xs backdrop-blur-sm bg-background-dark/20 relative z-10">
        <p>© 2026 AIPromo Event Platform. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default Login;