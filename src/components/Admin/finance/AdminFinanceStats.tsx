import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import paymentService from "../../../services/paymentService";
import { fetchAdminReportsOverview, fetchFundFlow } from "../../../store/adminReportsSlice";
import type { FundFlowPeriod } from "../../../types/adminReports/adminReports";
import {
  MdTrendingUp,
  MdAccountBalanceWallet,
  MdOutbound,
  MdReceiptLong,
} from "react-icons/md";
import AdminStatsCard from "../shared/AdminStatsCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_FEE_PERCENTAGE = 15;

const FUND_FLOW_CARDS = [
  { key: "ticketPurchase" as const,    label: "Mua vé",     icon: "confirmation_number",   isOutflow: false },
  { key: "aiPackagePurchase" as const, label: "Mua gói AI", icon: "smart_toy",              isOutflow: false },
  { key: "walletTopUp" as const,       label: "Nạp ví",     icon: "account_balance_wallet", isOutflow: false },
  { key: "refund" as const,            label: "Hoàn tiền",  icon: "assignment_return",      isOutflow: true  },
  { key: "withdrawal" as const,        label: "Rút tiền",   icon: "payments",               isOutflow: true  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const glassCardStyle: React.CSSProperties = {
  background: "rgba(124, 59, 237, 0.05)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(124, 59, 237, 0.3)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const neonTextGreen: React.CSSProperties = {
  color: "#10b981",
  textShadow: "0 0 8px rgba(16, 185, 129, 0.4)",
};

const neonTextOrange: React.CSSProperties = {
  color: "#f97316",
  textShadow: "0 0 8px rgba(249, 115, 22, 0.4)",
};

// ─── Helpers: previous period label ──────────────────────────────────────────

const VI_MONTHS = [
  "tháng 1","tháng 2","tháng 3","tháng 4","tháng 5","tháng 6",
  "tháng 7","tháng 8","tháng 9","tháng 10","tháng 11","tháng 12",
];

function formatShortDate(d: Date) {
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

function getPreviousPeriodLabel(period: FundFlowPeriod, currentStartUtc: string): string {
  const start = new Date(currentStartUtc);

  if (period === "Month") {
    const prev = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1));
    return `so với ${VI_MONTHS[prev.getUTCMonth()]}/${prev.getUTCFullYear()}`;
  }

  if (period === "Week") {
    const prevEnd   = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const prevStart = new Date(prevEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
    return `so với tuần ${formatShortDate(prevStart)} - ${formatShortDate(prevEnd)}`;
  }

  if (period === "Quarter") {
    const prev        = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 3, 1));
    const prevQuarterNum = Math.floor(prev.getUTCMonth() / 3) + 1;
    return `so với quý ${prevQuarterNum}/${prev.getUTCFullYear()}`;
  }

  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminFinanceStats() {
  const dispatch = useDispatch<AppDispatch>();
  const { globalRevenue, loading: revenueLoading, error } = useSelector(
    (state: RootState) => state.REVENUE
  );
  const { data: reportsData, fundFlow, fundFlowLoading } = useSelector(
    (state: RootState) => state.ADMIN_REPORTS
  );
  const [localTotalTransactions, setLocalTotalTransactions] = useState<number | null>(null);
  const [localLoadingTransactions, setLocalLoadingTransactions] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<FundFlowPeriod>("Month");

  useEffect(() => {
    dispatch(fetchAdminReportsOverview());
    (async () => {
      try {
        setLocalLoadingTransactions(true);
        const res = await paymentService.getAdminPaymentTransactions({ PageNumber: 1, PageSize: 1, SortColumn: "CreatedAt", SortOrder: "desc", Status: "Completed" });
        const data = res.data?.data ?? res.data;
        setLocalTotalTransactions(data?.totalCount ?? null);
      } catch {
        setLocalTotalTransactions(null);
      } finally {
        setLocalLoadingTransactions(false);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFundFlow(selectedTimeFilter));
  }, [dispatch, selectedTimeFilter]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const grossRevenue      = reportsData?.kpis?.totalRevenue?.value ?? globalRevenue?.data?.grossRevenue ?? 0;
  const netRevenue        = globalRevenue?.data?.netRevenue ?? 0;
  const eventCount        = reportsData?.kpis?.events?.total ?? globalRevenue?.data?.eventCount ?? 0;
  const totalTransactions = localTotalTransactions ?? 0;
  const platformFee       = useMemo(() => (grossRevenue * PLATFORM_FEE_PERCENTAGE) / 100, [grossRevenue]);

  const current    = fundFlow?.current;
  const comparison = fundFlow?.comparison;

  const previousPeriodLabel = useMemo(() => {
    if (!fundFlow?.currentPeriodStartUtc) return "";
    return getPreviousPeriodLabel(selectedTimeFilter, fundFlow.currentPeriodStartUtc);
  }, [fundFlow?.currentPeriodStartUtc, selectedTimeFilter]);

  const renderTrend = (isPositive?: boolean, changeRate?: number, difference?: number) => {
    const rate = changeRate ?? 0;
    const diff = difference ?? 0;

    const trendContent = (rate === 0 && diff === 0) ? (
      <div className="flex items-center text-slate-500 text-xs font-black tracking-widest uppercase mb-1">
        <span className="material-symbols-outlined text-sm mr-1">remove</span>
        0.0%
      </div>
    ) : (
      <div
        className="flex items-center text-xs font-black tracking-widest uppercase mb-1"
        style={isPositive ? neonTextGreen : neonTextOrange}
      >
        <span className="material-symbols-outlined text-sm mr-1">
          {isPositive ? "trending_up" : "trending_down"}
        </span>
        {Math.abs(rate).toFixed(1)}%
      </div>
    );

    return (
      <>
        {trendContent}
        <div className="text-xs text-slate-500 font-bold tracking-wider">
          {rate === 0 && diff === 0
            ? "0 VND"
            : `${isPositive ? "+" : "-"}${Math.abs(diff).toLocaleString("vi-VN")} VND`
          }
        </div>
        {previousPeriodLabel && (
          <div className="text-xs text-slate-600 font-medium mt-1 italic">{previousPeriodLabel}</div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          label="Tổng Doanh Thu"
          value={revenueLoading ? "Đang tải..." : formatCurrency(grossRevenue)}
          change={error ? "Lỗi" : `${eventCount} sự kiện`}
          subtext={error ? error : "tháng trước"}
          icon={<MdTrendingUp className="text-sm" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          showGradientBar
        />
        <AdminStatsCard
          label="Phí nền tảng"
          value={revenueLoading ? "Đang tải..." : formatCurrency(platformFee)}
          change={`${PLATFORM_FEE_PERCENTAGE}% phí`}
          subtext="chiết khấu từ tổng doanh thu"
          icon={<MdAccountBalanceWallet className="text-sm" />}
        />
        <AdminStatsCard
          label="Tổng Thanh toán"
          value={revenueLoading ? "Đang tải..." : formatCurrency(netRevenue)}
          change={error ? "Lỗi" : `${eventCount} sự kiện`}
          subtext={error ? error : "đang chờ duyệt"}
          icon={<MdOutbound className="text-sm" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <AdminStatsCard
          label="Giao dịch hoàn thành"
          value={localLoadingTransactions ? "Đang tải..." : totalTransactions.toLocaleString("vi-VN")}
          icon={<MdReceiptLong className="text-sm" />}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
        />
      </div>

      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Nguồn tiền của hệ thống</h3>
        <p className="text-slate-400 text-sm">Theo dõi và phân tích các nguồn thu nhập chính của nền tảng</p>
      </div>

      {/* Time Filter */}
      <div className="flex items-center justify-between border-b border-violet-500/10 pb-6 pt-4">
        <div className="flex items-center space-x-1 bg-[#120D1D] p-1 rounded-xl border border-violet-500/10">
          {(["Week", "Month", "Quarter"] as FundFlowPeriod[]).map((period) => {
            const label = { Week: "TUẦN", Month: "THÁNG", Quarter: "QUÝ" }[period];
            const isActive = selectedTimeFilter === period;
            return (
              <button
                key={period}
                onClick={() => setSelectedTimeFilter(period)}
                className={`px-5 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-all ${
                  isActive
                    ? "bg-violet-500 text-white shadow-[0_0_15px_rgba(124,59,237,0.4)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fund Flow 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {FUND_FLOW_CARDS.map(({ key, label, icon, isOutflow }) => {
          const value = current?.[key] ?? 0;
          const cmp   = comparison?.[key];

          return (
            <div key={key} style={glassCardStyle} className="p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
              {/* Icon */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${isOutflow ? "bg-orange-500/10 border border-orange-500/20" : "bg-violet-500/20 border border-violet-500/30"}`}>
                  <span className={`material-symbols-outlined text-xl ${isOutflow ? "text-orange-400" : "text-violet-400"}`}>
                    {icon}
                  </span>
                </div>
              </div>

              {/* Label + Value — matched to AdminStatsCard typography */}
              <div className="mb-4">
                <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-2">{label}</p>
                {fundFlowLoading ? (
                  <div className="h-8 w-3/4 bg-slate-700/40 rounded animate-pulse" />
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-2xl font-bold leading-none"
                      style={isOutflow ? neonTextOrange : { color: "#ffffff" }}
                    >
                      {value.toLocaleString("vi-VN")}
                    </span>
                    <span className={`text-xs font-semibold ${isOutflow ? "text-orange-400/60" : "text-slate-500"}`}>
                      VND
                    </span>
                  </div>
                )}
              </div>

              {/* Trend + previous period label */}
              <div className="pt-3 border-t border-violet-500/10">
                {fundFlowLoading
                  ? <div className="h-8 bg-slate-700/30 rounded animate-pulse" />
                  : renderTrend(cmp?.isPositiveGrowth, cmp?.changeRate, cmp?.difference)
                }
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 w-full h-0.5 opacity-50"
                style={{ background: `linear-gradient(to right, ${isOutflow ? "#ea580c" : "#7c3bed"}, transparent)` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}