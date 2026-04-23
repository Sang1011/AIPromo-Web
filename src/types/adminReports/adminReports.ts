export interface KpiMetric {
    value: number;
    monthlyGrowthRate?: number;
    isPositiveGrowth?: boolean;
}

export interface KpiWithTotal {
    total: number;
}

export interface EventsKpi {
    total: number;
    liveNow: number;
}

export interface UserDistribution {
    count: number;
    percentage: number;
}

export interface UserDistributionData {
    attendees: UserDistribution;
    organizers: UserDistribution;
    growthRate: number;
}

export interface AdminReportsKpis {
    totalRevenue: KpiMetric;
    activeUsers: KpiWithTotal;
    events: EventsKpi;
    ticketsSold: KpiWithTotal;
}

export interface AdminReportsData {
    kpis: AdminReportsKpis;
    userDistribution: UserDistributionData;
}

export type AdminReportsResponse = {
    isSuccess: boolean;
    data: AdminReportsData;
    message: string;
    timestamp: string;
};

export interface SalesTrendDataPoint {
    dateLabel: string;
    revenue: number;
    transactions: number;
}

export interface SalesTrendData {
    chartData: SalesTrendDataPoint[];
}

export type SalesTrendResponse = {
    isSuccess: boolean;
    data: SalesTrendData;
    message: string;
    timestamp: string;
};

export interface TopEventItem {
    eventId: string;
    title: string;
    bannerUrl: string | null;
    status: string;
    totalRevenue: number;
    ticketsSold: number;
}

export interface TopEventsData {
    events: TopEventItem[];
}

export type TopEventsResponse = {
    isSuccess: boolean;
    data: TopEventsData;
    message: string;
    timestamp: string;
};

// ── Fund Flow ────────────────────────────────────────────────────────────────

export type FundFlowPeriod = "Week" | "Month" | "Quarter";

export interface FundFlowBreakdown {
    ticketPurchase: number;
    aiPackagePurchase: number;
    walletTopUp: number;
    refund: number;
    withdrawal: number;
}

export interface FundFlowComparisonItem {
    currentValue: number;
    previousValue: number;
    difference: number;
    changeRate: number;
    isPositiveGrowth: boolean;
}

export interface FundFlowComparison {
    ticketPurchase: FundFlowComparisonItem;
    aiPackagePurchase: FundFlowComparisonItem;
    walletTopUp: FundFlowComparisonItem;
    refund: FundFlowComparisonItem;
    withdrawal: FundFlowComparisonItem;
}

export interface FundFlowData {
    period: string;
    currentPeriodStartUtc: string;
    currentPeriodEndUtc: string;
    current: FundFlowBreakdown;
    previous: FundFlowBreakdown;
    comparison: FundFlowComparison;
}

export type FundFlowResponse = {
    isSuccess: boolean;
    data: FundFlowData;
    message: string;
    timestamp: string;
};