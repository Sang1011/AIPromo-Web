import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import "./AllEvent.css";
import { fetchAllEvents } from "../../store/eventSlice";
import type { AppDispatch, RootState } from "../../store";
import type { Category } from "../../types/category/category";
import { fetchAllCategories } from "../../store/categorySlice";

const INPUT_CLS =
  "w-full py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all";

const CATEGORY_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

function getCategoryColor(id: number) {
  return CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}

/* ── Price helpers ── */
const PRICE_MIN = 0;
const PRICE_MAX = 20_000_000;
const PRICE_STEP = 100_000;

const formatVND = (amount: number) =>
  amount === 0
    ? "Miễn phí"
    : new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

const formatVNDShort = (amount: number) => {
  if (amount === 0) return "Miễn phí";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}tr`;
  return `${(amount / 1_000).toFixed(0)}k`;
};

/* ── Dual Range Slider ── */
interface DualRangeProps {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

function DualRangeSlider({ min, max, step, valueMin, valueMax, onChangeMin, onChangeMax }: DualRangeProps) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="relative w-full">
      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-white/10 mt-2 mb-1">
        {/* Active fill */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
      </div>

      {/* Min thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v <= valueMax - step) onChangeMin(v);
        }}
        className="dual-range-thumb absolute inset-0 w-full opacity-0 cursor-pointer h-5 -mt-2"
        style={{ zIndex: valueMin > max - step ? 5 : 3 }}
      />

      {/* Max thumb */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v >= valueMin + step) onChangeMax(v);
        }}
        className="dual-range-thumb absolute inset-0 w-full opacity-0 cursor-pointer h-5 -mt-2"
        style={{ zIndex: 4 }}
      />

      {/* Thumb dots (visual) */}
      <div
        className="absolute w-4 h-4 rounded-full bg-white border-2 border-violet-500 shadow-md -mt-3.5 -translate-x-1/2 pointer-events-none"
        style={{ left: `${pct(valueMin)}%`, top: "50%" }}
      />
      <div
        className="absolute w-4 h-4 rounded-full bg-white border-2 border-violet-500 shadow-md -mt-3.5 -translate-x-1/2 pointer-events-none"
        style={{ left: `${pct(valueMax)}%`, top: "50%" }}
      />
    </div>
  );
}

function AllEvent() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const events = useSelector((state: RootState) => state.EVENT.events);
  const pagination = useSelector((state: RootState) => state.EVENT.pagination);
  const categoriesData: Category[] =
    useSelector((s: RootState) => s.CATEGORY?.categories) ?? [];

  useEffect(() => {
    dispatch(fetchAllCategories({}));
  }, [dispatch]);

  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">("Descending");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    const categoryId = searchParams.get("categoryId");
    if (categoryId) setSelectedCategoryIds([Number(categoryId)]);
  }, []);

  const [searchTitle, setSearchTitle] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Price range state ── */
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const isPriceFiltered = priceMin > PRICE_MIN || priceMax < PRICE_MAX;

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTitleChange = (val: string) => {
    setSearchTitle(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedTitle(val), 350);
  };

  useEffect(() => {
    dispatch(
      fetchAllEvents({
        CategoryId: selectedCategoryIds.length === 1 ? selectedCategoryIds[0] : undefined,
        PageNumber: currentPage,
        PageSize: PAGE_SIZE,
        SortColumn: "eventStartAt",
        SortOrder: sortOrder,
      })
    );
  }, [dispatch, currentPage, sortOrder, selectedCategoryIds]);

  const handleSortChange = (order: "Ascending" | "Descending") => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTitle("");
    setDebouncedTitle("");
    setLocationInput("");
    setDateFrom("");
    setDateTo("");
    setSelectedCategoryIds([]);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
  };

  const hasActiveFilters =
    debouncedTitle.trim() !== "" ||
    locationInput.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    selectedCategoryIds.length > 0 ||
    isPriceFiltered;

  const allCategories = categoriesData.filter((c) => c.isActive);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setCurrentPage(1);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const titleMatch =
        debouncedTitle.trim() === "" ||
        event.title.toLowerCase().includes(debouncedTitle.toLowerCase().trim());
      const locationMatch =
        locationInput.trim() === "" ||
        event.location?.toLowerCase().includes(locationInput.toLowerCase().trim());
      const eventDate = event.eventStartAt ? new Date(event.eventStartAt) : null;
      const fromMatch = dateFrom === "" || (eventDate !== null && eventDate >= new Date(dateFrom));
      const toMatch = dateTo === "" || (eventDate !== null && eventDate <= new Date(dateTo + "T23:59:59"));
      const categoryMatch =
        selectedCategoryIds.length === 0 ||
        event.categories?.some((c) => selectedCategoryIds.includes(c.id));

      /* price filter: event overlaps [priceMin, priceMax] */
      const eMin = event.minPrice ?? 0;
      const eMax = event.maxPrice ?? event.minPrice ?? 0;
      const priceMatch = eMin <= priceMax && eMax >= priceMin;

      return titleMatch && locationMatch && fromMatch && toMatch && categoryMatch && priceMatch;
    });
  }, [events, debouncedTitle, locationInput, dateFrom, dateTo, selectedCategoryIds, priceMin, priceMax]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaginationPages = () => {
    if (!pagination) return [];
    const { totalPages } = pagination;
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  /* active filter badge count */
  const activeFilterCount = [
    debouncedTitle,
    locationInput,
    dateFrom || dateTo,
    isPriceFiltered ? "price" : "",
  ].filter(Boolean).length + selectedCategoryIds.length;

  return (
    <>
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-8 mt-10">

        {/* ── Hero Title ── */}
        <div className="mb-10 flex flex-col items-center gap-3 text-center pt-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-1 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Khám phá sự kiện
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Tất cả <span className="text-primary">Sự Kiện</span>
          </h1>
          <p className="text-slate-400 text-base max-w-md">
            Tìm kiếm và khám phá những sự kiện thú vị được tuyển chọn dành riêng cho bạn.
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="glass-effect rounded-2xl p-5 mb-8 shadow-lg">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search title */}
            <div className="relative flex-1 min-w-[220px]">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm tên sự kiện..."
                value={searchTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={`${INPUT_CLS} pl-11 pr-9`}
              />
              {searchTitle && (
                <button
                  onClick={() => { setSearchTitle(""); setDebouncedTitle(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="h-9 w-px bg-white/10 hidden sm:block" />

            {/* Sort */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => handleSortChange("Ascending")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortOrder === "Ascending"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                Ascending
              </button>
              <button
                onClick={() => handleSortChange("Descending")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${sortOrder === "Descending"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                Descending
              </button>
            </div>

            <div className="h-9 w-px bg-white/10 hidden sm:block" />

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${showFilters || hasActiveFilters
                ? "bg-primary text-white border-primary shadow-[0_0_16px_rgba(121,59,237,0.4)]"
                : "bg-white/5 border-white/10 text-slate-300 hover:border-primary/50 hover:text-white"
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Bộ lọc
              {hasActiveFilters && (
                <span className="bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Result count */}
            {pagination && (
              <div className="ml-auto text-slate-400 text-sm shrink-0">
                Hiển thị{" "}
                <span className="text-white font-bold">{filteredEvents.length}</span>
                {hasActiveFilters && (
                  <span className="text-slate-500"> / {pagination.totalCount}</span>
                )}{" "}
                sự kiện
              </div>
            )}
          </div>

          {/* Row 2: Expanded filters */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-white/10 space-y-5">
              {/* Location + Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-2 ml-1 uppercase tracking-wide">
                    Địa điểm
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                      location_on
                    </span>
                    <input
                      type="text"
                      placeholder="Nhập tỉnh / thành phố..."
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className={`${INPUT_CLS} pl-9 pr-9`}
                    />
                    {locationInput && (
                      <button
                        onClick={() => setLocationInput("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-2 ml-1 uppercase tracking-wide">
                    Từ ngày
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                      calendar_today
                    </span>
                    <input
                      type="date"
                      lang="vi-VN"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className={`${INPUT_CLS} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-2 ml-1 uppercase tracking-wide">
                    Đến ngày
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
                      event
                    </span>
                    <input
                      type="date"
                      lang="vi-VN"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className={`${INPUT_CLS} pl-9`}
                    />
                  </div>
                </div>
              </div>

              {/* ── Price Range Filter ── */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">sell</span>
                    Khoảng giá vé
                  </label>
                  {isPriceFiltered && (
                    <button
                      onClick={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); }}
                      className="text-[11px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      Đặt lại
                    </button>
                  )}
                </div>

                {/* Labels */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-sm font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: "rgba(124,59,237,0.18)",
                      color: "#c084fc",
                      border: "1px solid rgba(124,59,237,0.35)",
                    }}
                  >
                    {priceMin === 0 ? "Miễn phí" : formatVND(priceMin)}
                  </span>
                  <span className="text-slate-600 text-xs">→</span>
                  <span
                    className="text-sm font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: "rgba(124,59,237,0.18)",
                      color: "#c084fc",
                      border: "1px solid rgba(124,59,237,0.35)",
                    }}
                  >
                    {priceMax >= PRICE_MAX ? "20tr+" : formatVND(priceMax)}
                  </span>
                </div>

                {/* Dual slider */}
                <DualRangeSlider
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  valueMin={priceMin}
                  valueMax={priceMax}
                  onChangeMin={setPriceMin}
                  onChangeMax={setPriceMax}
                />

                {/* Tick labels */}
                <div className="flex justify-between mt-3">
                  {[0, 5_000_000, 10_000_000, 15_000_000, 20_000_000].map((v) => (
                    <span key={v} className="text-[10px] text-slate-600">
                      {formatVNDShort(v)}
                    </span>
                  ))}
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/8">
                  {[
                    { label: "Miễn phí", min: 0, max: 0 },
                    { label: "Dưới 200k", min: 0, max: 200_000 },
                    { label: "200k – 500k", min: 200_000, max: 500_000 },
                    { label: "500k – 1tr", min: 500_000, max: 1_000_000 },
                    { label: "Trên 1tr", min: 1_000_000, max: PRICE_MAX },
                  ].map((preset) => {
                    const active = priceMin === preset.min && priceMax === preset.max;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => { setPriceMin(preset.min); setPriceMax(preset.max); }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${active
                          ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(121,59,237,0.4)]"
                          : "bg-white/5 border-white/10 text-slate-400 hover:border-primary/40 hover:text-white"
                          }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category chips */}
              {allCategories.length > 0 && (
                <div className="pt-1">
                  <label className="block text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wide">
                    Danh mục
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => {
                      const active = selectedCategoryIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${active
                            ? "bg-primary text-white border-primary shadow-[0_0_12px_rgba(121,59,237,0.4)]"
                            : `${getCategoryColor(cat.id)} hover:opacity-80`
                            }`}
                        >
                          {active && <span className="material-symbols-outlined text-[13px]">check</span>}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {debouncedTitle && (
                <span className="bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/25 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px]">title</span>
                  "{debouncedTitle}"
                  <button onClick={() => { setSearchTitle(""); setDebouncedTitle(""); }}>
                    <span className="material-symbols-outlined text-[13px] hover:opacity-70">close</span>
                  </button>
                </span>
              )}
              {locationInput && (
                <span className="bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/25 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  {locationInput}
                  <button onClick={() => setLocationInput("")}>
                    <span className="material-symbols-outlined text-[13px] hover:opacity-70">close</span>
                  </button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/25 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px]">date_range</span>
                  {dateFrom || "..."} → {dateTo || "..."}
                  <button onClick={() => { setDateFrom(""); setDateTo(""); }}>
                    <span className="material-symbols-outlined text-[13px] hover:opacity-70">close</span>
                  </button>
                </span>
              )}
              {isPriceFiltered && (
                <span className="bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/25 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px]">sell</span>
                  {priceMin === 0 ? "Miễn phí" : formatVNDShort(priceMin)} – {priceMax >= PRICE_MAX ? "20tr+" : formatVNDShort(priceMax)}
                  <button onClick={() => { setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX); }}>
                    <span className="material-symbols-outlined text-[13px] hover:opacity-70">close</span>
                  </button>
                </span>
              )}
              {selectedCategoryIds.map((id) => {
                const cat = allCategories.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <span key={id} className="bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/25 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">label</span>
                    {cat.name}
                    <button onClick={() => toggleCategory(id)}>
                      <span className="material-symbols-outlined text-[13px] hover:opacity-70">close</span>
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-slate-500 text-xs font-semibold hover:text-white transition-colors flex items-center gap-1 ml-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                Xoá tất cả
              </button>
            </div>
          )}
        </div>

        {/* ── Events Grid ── */}
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
              <span className="material-symbols-outlined text-5xl text-slate-600">event_busy</span>
            </div>
            <p className="text-xl font-bold text-slate-400 mb-1">Không tìm thấy sự kiện</p>
            <p className="text-sm text-slate-600 mb-5">Thử thay đổi bộ lọc để xem thêm kết quả</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 text-sm font-bold hover:bg-primary/30 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => {
              const isFree = (event.minPrice ?? 0) === 0;
              return (
                <div
                  key={event.id}
                  className="group bg-surface rounded-2xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(121,59,237,0.2)] flex flex-col h-full"
                >
                  {/* Banner */}
                  <div className="relative aspect-video overflow-hidden bg-slate-800">
                    {event.bannerUrl ? (
                      <img
                        alt={event.title}
                        src={event.bannerUrl}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <span className="material-symbols-outlined text-slate-600 text-5xl">image</span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Categories */}
                    {event.categories && event.categories.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                        {event.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-black/40 text-white border border-white/20"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ── Price badge ── */}
                    {event.minPrice !== undefined && event.minPrice !== null && (
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className="flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide"
                          style={
                            isFree
                              ? {
                                background: "rgba(20,184,166,0.25)",
                                color: "#2dd4bf",
                                border: "1px solid rgba(20,184,166,0.55)",
                                boxShadow: "0 0 12px rgba(20,184,166,0.25)",
                              }
                              : {
                                background: "linear-gradient(135deg, rgba(124,59,237,0.6), rgba(168,85,247,0.6))",
                                color: "#f1f0ff",
                                border: "1px solid rgba(168,85,247,0.6)",
                                boxShadow: "0 0 14px rgba(124,59,237,0.35)",
                              }
                          }
                        >
                          <svg
                            width="11" height="11" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                          >
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                          </svg>
                          {isFree ? "Miễn phí" : `Từ ${formatVND(event.minPrice)}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <h3 className="text-white text-[17px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {event.title}
                    </h3>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-2">
                      {event.eventStartAt && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                          </div>
                          <span className="text-slate-300 text-sm">
                            {formatDate(event.eventStartAt)}
                            <span className="text-slate-500 mx-1">•</span>
                            <span className="text-slate-400">{formatTime(event.eventStartAt)}</span>
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                          </div>
                          <span className="text-slate-300 text-sm line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/event-detail/${event.urlPath}`)}
                      className="mt-1 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(121,59,237,0.35)] flex items-center justify-center gap-2"
                    >
                      Xem chi tiết
                      <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && !hasActiveFilters && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5">
              {getPaginationPages().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-slate-600 px-1">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${currentPage === page
                      ? "bg-primary text-white shadow-[0_0_16px_rgba(121,59,237,0.5)]"
                      : "bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-primary/40"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white hover:border-primary/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default AllEvent;