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
