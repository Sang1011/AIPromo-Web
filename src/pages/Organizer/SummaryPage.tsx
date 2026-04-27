import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchOverviewOrganizerStats,
    fetchSalesTrend,
} from "../../store/ticketingSlice";
import {
    fetchRefundRate,
    fetchTransactionSummary,
} from "../../store/reportSlice";
import type {
    OverviewStatistic,
    SalesTrendData,
    SalesTrendPeriod,
} from "../../types/ticketing/ticketing";
import type {
    RefundRateReportItem,
    TransactionSummaryReportItem,
} from "../../types/report/report";

import RevenueCards from "../../components/Organizer/overview/RevenueCards";
import RevenueChart from "../../components/Organizer/overview/RevenueChart";
import TicketTypeBreakdownTable from "../../components/Organizer/overview/TicketTypeBreakdownTable";
import TicketTypeBarChart from "../../components/Organizer/overview/ticketTypeBarChart"
import RefundRateCard from "../../components/Organizer/overview/RefundRateCard";
import TransactionSummaryCard from "../../components/Organizer/overview/TransactionSummaryCard";

// ─── Mock data ────────────────────────────────────────────────────────────────

const USE_MOCK = false;

const mockOverviewStats: OverviewStatistic = {
    eventId: "mock-event-id",
    summary: {
        totalOrders: 312,
        totalTicketsSold: 420,
        totalTicketsCheckedIn: 350,
        checkInRate: 83.3,
        grossRevenue: 167_000_000,
        totalDiscount: 12_500_000,
        netRevenue: 154_500_000,
    },
    ticketTypeBreakdown: [
        {
            ticketTypeId: "vip",
            ticketTypeName: "VIP",
            totalQuantity: 100,
            quantitySold: 90,
            quantityCheckedIn: 80,
            revenue: 90_000_000,
        },
        {
            ticketTypeId: "standard",
            ticketTypeName: "Standard",
            totalQuantity: 300,
            quantitySold: 250,
            quantityCheckedIn: 210,
            revenue: 62_500_000,
        },
        {
            ticketTypeId: "student",
            ticketTypeName: "Student",
            totalQuantity: 100,
            quantitySold: 80,
            quantityCheckedIn: 60,
            revenue: 14_500_000,
        },
    ],
};

const mockSalesTrendDay: SalesTrendData = {
    eventId: "mock-event-id",
    period: "Day",
    trend: [
        { timeLabel: "25/03", ticketsSold: 12, revenue: 6_000_000 },
        { timeLabel: "26/03", ticketsSold: 28, revenue: 14_000_000 },
        { timeLabel: "27/03", ticketsSold: 45, revenue: 22_500_000 },
        { timeLabel: "28/03", ticketsSold: 60, revenue: 30_000_000 },
        { timeLabel: "29/03", ticketsSold: 85, revenue: 42_500_000 },
        { timeLabel: "30/03", ticketsSold: 70, revenue: 35_000_000 },
        { timeLabel: "31/03", ticketsSold: 55, revenue: 27_500_000 },
        { timeLabel: "01/04", ticketsSold: 65, revenue: 32_500_000 },
    ],
};

const mockSalesTrendWeek: SalesTrendData = {
    eventId: "mock-event-id",
    period: "Week",
    trend: [
        { timeLabel: "Tuần 1", ticketsSold: 80, revenue: 40_000_000 },
        { timeLabel: "Tuần 2", ticketsSold: 150, revenue: 75_000_000 },
        { timeLabel: "Tuần 3", ticketsSold: 190, revenue: 95_000_000 },
    ],
};

const mockRefundRate: RefundRateReportItem = {
    eventId: "mock-event-id",
    grossRevenue: 167_000_000,
    netRevenue: 158_000_000,
    totalRefunds: 8_500_000,
    refundRatePercent: 5.09,
};

const mockTransactionSummary: TransactionSummaryReportItem = {
    eventId: "mock-event-id",
    totalTransactions: 342,
    completedCount: 312,
    failedCount: 18,
    refundedCount: 12,
    walletPayAmount: 98_000_000,
    directPayAmount: 56_500_000,
};

// ─── Empty-state fallbacks (shown when API returns no data yet) ───────────────

const emptyRefundRate = (eventId: string): RefundRateReportItem => ({
    eventId,
    grossRevenue: 0,
    netRevenue: 0,
    totalRefunds: 0,
    refundRatePercent: 0,
});

const emptyTransactionSummary = (eventId: string): TransactionSummaryReportItem => ({
    eventId,
    totalTransactions: 0,
    completedCount: 0,
    failedCount: 0,
    refundedCount: 0,
    walletPayAmount: 0,
    directPayAmount: 0,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function SummaryPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const dispatch = useDispatch<AppDispatch>();

    // ── Ticketing slice ──────────────────────────────────────────────────────
    const {
        overviewStats: reduxOverview,
        loading: reduxLoading,
        salesTrend: reduxTrend,
        salesTrendLoading: reduxTrendLoading,
    } = useSelector((state: RootState) => state.TICKETING);

    // ── Report slice ─────────────────────────────────────────────────────────
    const {
        refundRate: reduxRefundRate,
        transactionSummary: reduxTransactionSummary,
        loading: reportLoading,
    } = useSelector((state: RootState) => state.REPORT);

    const [period, setPeriod] = useState<SalesTrendPeriod>("Day");

    // ── Mock state ───────────────────────────────────────────────────────────
    const [mockOverview, setMockOverview] = useState<OverviewStatistic | null>(null);
    const [mockTrend, setMockTrend] = useState<SalesTrendData | null>(null);
    const [mockLoading, setMockLoading] = useState(false);
    const [mockTrendLoading, setMockTrendLoading] = useState(false);


    // ── Active data source ───────────────────────────────────────────────────
    const overviewStats = USE_MOCK ? mockOverview : reduxOverview;
    const salesTrend = USE_MOCK ? mockTrend : reduxTrend;
    const loading = USE_MOCK ? mockLoading : reduxLoading;
    const salesTrendLoading = USE_MOCK ? mockTrendLoading : reduxTrendLoading;

    const refundRateLoading = USE_MOCK ? false : !!reportLoading.refundRate;
    const transactionLoading = USE_MOCK ? false : !!reportLoading.transaction;

    // Always render both cards — fallback to zero/empty state when no data
    const refundRate = USE_MOCK
        ? mockRefundRate
        : (reduxRefundRate ?? emptyRefundRate(eventId ?? ""));
    const transactionSummary = USE_MOCK
        ? mockTransactionSummary
        : (reduxTransactionSummary ?? emptyTransactionSummary(eventId ?? ""));

    // ── Fetch overview once on mount ─────────────────────────────────────────
    useEffect(() => {
        if (!eventId) return;

        if (USE_MOCK) {
            setMockLoading(true);
            setTimeout(() => {
                setMockOverview(mockOverviewStats);
                setMockLoading(false);
            }, 600);
        } else {
            dispatch(fetchOverviewOrganizerStats({ eventId }));
            dispatch(fetchRefundRate(eventId));
            dispatch(fetchTransactionSummary(eventId));
        }
    }, [eventId, dispatch]);

    // ── Fetch trend when period changes ─────────────────────────────────────
    useEffect(() => {
        if (!eventId) return;

        if (USE_MOCK) {
            setMockTrendLoading(true);
            setTimeout(() => {
                setMockTrend(period === "Day" ? mockSalesTrendDay : mockSalesTrendWeek);
                setMockTrendLoading(false);
            }, 400);
        } else {
            dispatch(fetchSalesTrend({ eventId, period }));
        }
    }, [eventId, period, dispatch]);

    if (loading && !overviewStats) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }


    return (
        <div className="space-y-8">
            {/* ── Revenue summary cards ──────────────────────────────────── */}
            {overviewStats?.summary && (
                <RevenueCards summary={overviewStats.summary} />
            )}

            {/* ── Sales trend chart ──────────────────────────────────────── */}
            <RevenueChart
                trendData={salesTrend}
                period={period}
                loading={salesTrendLoading}
                onPeriodChange={setPeriod}
            />

            {/* ── Refund & Transaction analytics (side by side) ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RefundRateCard data={refundRate} loading={refundRateLoading} />
                <TransactionSummaryCard data={transactionSummary} loading={transactionLoading} />
            </div>

            {/* ── Ticket type breakdown ──────────────────────────────────── */}
            {overviewStats?.ticketTypeBreakdown && (
                <>
                    <TicketTypeBarChart breakdown={overviewStats.ticketTypeBreakdown} />
                    <TicketTypeBreakdownTable breakdown={overviewStats.ticketTypeBreakdown} />
                </>
            )}
        </div>
    );
}