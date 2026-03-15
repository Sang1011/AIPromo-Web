import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Link } from "react-router-dom";

interface UserInfo {
  userId?: string;
  name?: string;
}

const Header: React.FC = () => {
  const { currentInfor } = useSelector((state: RootState) => state.AUTH);
  const user = currentInfor as UserInfo;

  const isLoggedIn = Boolean(user?.userId);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("DEVICE_ID");

    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0B0B12]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo + Navigation */}
        <div className="flex items-center gap-10">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">
                bolt
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white">
              AIPromo
            </h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            {["Khám phá", "Sự kiện", "Giải pháp", "Giá cả"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-300 hover:text-primary transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">

          {/* Nút tạo sự kiện */}
          <Link
            to="/create-event"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">
              add
            </span>
            Tạo sự kiện
          </Link>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              
              {/* User button */}
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)}
                </div>

                <span className="text-sm font-medium text-white">
                  {user?.name}
                </span>

                <span className="material-symbols-outlined text-slate-400 text-base">
                  {dropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                  <div className="px-5 py-4 border-b border-white/10">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Lịch sử sự kiện
                    </p>

                    <p className="text-slate-500 text-xs">
                      Chưa có dữ liệu
                    </p>
                  </div>

                  <div className="px-5 py-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-primary transition-all"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;

