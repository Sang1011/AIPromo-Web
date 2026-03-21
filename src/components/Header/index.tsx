import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllEvents } from "../../store/eventSlice";

interface UserInfo {
  userId?: string;
  name?: string;
}

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentInfor } = useSelector((state: RootState) => state.AUTH);
  const events = useSelector((state: RootState) => state.EVENT.events);
  const user = currentInfor as UserInfo;

  const isLoggedIn = Boolean(user?.userId);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Luôn fetch events khi Header mount
  useEffect(() => {
    dispatch(fetchAllEvents({ PageNumber: 1, PageSize: 20, SortColumn: "eventStartAt", SortOrder: "Descending" }));
  }, [dispatch]);

  // Đóng user dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      // Đóng search panel khi click ngoài search container
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("DEVICE_ID");
    window.location.href = "/";
  };

  const suggestedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events.slice(0, 6);
    return events
      .filter((e) =>
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [events, searchQuery]);

  const handleSelectEvent = (id: number | string) => {
    setSearchFocused(false);
    setSearchQuery("");
    navigate(`/event-detail/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    navigate(`/all-event`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Overlay khi mở search */}
      {searchFocused && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onMouseDown={() => setSearchFocused(false)}
        />
      )}

      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0B0B12]/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            onClick={() => setSearchFocused(false)}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
              }}
            >
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="16,4 18.5,12 27,12 20.5,17 23,25 16,20 9,25 11.5,17 5,12 13.5,12" fill="white" opacity="0.95" />
                <line x1="26" y1="5" x2="26" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1="24.5" y1="6.5" x2="27.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                <line x1="6" y1="25" x2="6" y2="28" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                <line x1="4.5" y1="26.5" x2="7.5" y2="26.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "Georgia, serif" }}>
                AIPromo
              </h1>
              <span className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: "#A855F7" }}>
                Event Solutions
              </span>
            </div>
          </Link>

          {/* ── Search Bar ── */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl relative hidden md:block"
            style={{ zIndex: 51 }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div
                className="flex items-center rounded-2xl border transition-all duration-200"
                style={{
                  background: searchFocused ? "#16162a" : "rgba(255,255,255,0.06)",
                  borderColor: searchFocused ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.15)",
                  boxShadow: searchFocused ? "0 0 0 4px rgba(124,58,237,0.15)" : "none",
                }}
              >
                <span className="material-symbols-outlined text-slate-400 text-[20px] pl-4 pr-2 shrink-0">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Bạn tìm gì hôm nay?"
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none border-none py-3 pr-2"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery("");
                    }}
                    className="text-slate-500 hover:text-slate-300 pr-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="shrink-0 m-1.5 px-5 py-2 text-white text-sm font-bold rounded-xl transition-all"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* ── Dropdown Panel ── */}
            {searchFocused && (
              <div
                className="absolute left-0 right-0 bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                style={{ top: "calc(100% + 10px)", zIndex: 52 }}
              >
                {/* Tiêu đề */}
                <div className="px-5 pt-4 pb-3 border-b border-white/8 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-purple-400">auto_awesome</span>
                    {searchQuery.trim() ? `Kết quả cho "${searchQuery}"` : "Gợi ý dành cho bạn"}
                  </p>
                  <span className="text-[10px] text-slate-600">
                    {suggestedEvents.length} sự kiện
                  </span>
                </div>

                {/* Danh sách events */}
                {suggestedEvents.length > 0 ? (
                  <div className="py-2">
                    {suggestedEvents.map((event) => (
                      <button
                        key={event.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectEvent(event.id);
                        }}
                        className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all group text-left"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/8 bg-slate-800">
                          {event.bannerUrl ? (
                            <img
                              src={event.bannerUrl}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-slate-800">
                              <span className="material-symbols-outlined text-slate-600 text-2xl">event</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-white text-sm font-semibold line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {event.eventStartAt && (
                              <span className="flex items-center gap-1 text-slate-500 text-xs">
                                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                                {formatDate(event.eventStartAt)}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1 text-slate-500 text-xs">
                                <span className="material-symbols-outlined text-[13px] shrink-0">location_on</span>
                                <span className="line-clamp-1">{event.location}</span>
                              </span>
                            )}
                          </div>
                          {event.categories && event.categories.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {event.categories.slice(0, 2).map((cat: any) => (
                                <span
                                  key={cat.id}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <span className="material-symbols-outlined text-slate-700 group-hover:text-purple-400 text-[16px] transition-colors shrink-0">
                          arrow_forward_ios
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center text-slate-600">
                    <span className="material-symbols-outlined text-5xl mb-3">search_off</span>
                    <p className="text-sm font-semibold">Không tìm thấy sự kiện phù hợp</p>
                    <p className="text-xs text-slate-700 mt-1">Thử từ khóa khác nhé</p>
                  </div>
                )}

                {/* Nút Xem tất cả */}
                <div className="px-5 py-3 border-t border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchFocused(false);
                      navigate("/all-event");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">apps</span>
                    Xem tất cả sự kiện
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile search */}
            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 text-slate-300 transition-all">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Tạo sự kiện */}
            <Link
              to="/create-event"
              onClick={() => setSearchFocused(false)}
              className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Tạo sự kiện</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "rgba(124,58,237,0.3)" }}
                  >
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white hidden sm:inline">{user?.name}</span>
                  <span className="material-symbols-outlined text-slate-400 text-base">
                    {dropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#13131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Lịch sử sự kiện
                      </p>
                      <p className="text-slate-500 text-xs">Chưa có dữ liệu</p>
                    </div>
                    <div className="px-5 py-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;