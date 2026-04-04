import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reportService from "../services/reportService";
import type {
    GrossRevenueReportItem,
    NetRevenueReportItem,
    RefundAmountReportItem,
    RefundRateReportItem,
    TransactionSummaryReportItem,
    RevenueSummaryOrganizerReportItem,
    BreakdownItem
} from "../types/report/report";

interface ReportState {
    grossRevenue?: GrossRevenueReportItem;
    netRevenue?: NetRevenueReportItem;
    refundAmount?: RefundAmountReportItem;
    refundRate?: RefundRateReportItem;
    transactionSummary?: TransactionSummaryReportItem;
    revenueSummaryOrganizer?: RevenueSummaryOrganizerReportItem;
    revenueBreakdownOrganizer?: BreakdownItem[];
    loading: Record<string, boolean>;
    error: string | null;
}

const initialState: ReportState = {
    loading: {},
    error: null
};

export const fetchGrossRevenue = createAsyncThunk(
    "report/fetchGrossRevenue",
    async (eventId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getGrossRevenueReport(eventId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchNetRevenue = createAsyncThunk(
    "report/fetchNetRevenue",
    async (eventId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getNetRevenueReport(eventId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchRefundAmount = createAsyncThunk(
    "report/fetchRefundAmount",
    async (eventId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getRefundAmountReport(eventId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchRefundRate = createAsyncThunk(
    "report/fetchRefundRate",
    async (eventId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getRefundRateReport(eventId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchTransactionSummary = createAsyncThunk(
    "report/fetchTransactionSummary",
    async (eventId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getTransactionSummaryReport(eventId);
            console.log("transactionSummary redux:", res.data.data);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchRevenueSummaryOrganizer = createAsyncThunk(
    "report/fetchRevenueSummaryOrganizer",
    async (organizerId: string, { rejectWithValue }) => {
        try {
            const res = await reportService.getRevenueSummaryOrganizerReport(organizerId);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

export const fetchRevenueBreakdownOrganizer = createAsyncThunk(
    "report/fetchRevenueBreakdownOrganizer",
    async ({ organizerId, byNet }: { organizerId: string; byNet: boolean }, { rejectWithValue }) => {
        try {
            const res = await reportService.getRevenueBreakdownOrganizerReport(organizerId, byNet);
            return res.data.data.perEvent;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || "Error");
        }
    }
);

const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGrossRevenue.pending, (state) => {
                state.loading.grossRevenue = true;
            })
            .addCase(fetchGrossRevenue.fulfilled, (state, action) => {
                state.loading.grossRevenue = false;
                state.grossRevenue = action.payload;
            })
            .addCase(fetchGrossRevenue.rejected, (state, action) => {
                state.loading.grossRevenue = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchNetRevenue.pending, (state) => {
                state.loading.netRevenue = true;
            })
            .addCase(fetchNetRevenue.fulfilled, (state, action) => {
                state.loading.netRevenue = false;
                state.netRevenue = action.payload;
            })
            .addCase(fetchNetRevenue.rejected, (state, action) => {
                state.loading.netRevenue = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchRefundAmount.pending, (state) => {
                state.loading.refundAmount = true;
            })
            .addCase(fetchRefundAmount.fulfilled, (state, action) => {
                state.loading.refundAmount = false;
                state.refundAmount = action.payload;
            })
            .addCase(fetchRefundAmount.rejected, (state, action) => {
                state.loading.refundAmount = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchRefundRate.pending, (state) => {
                state.loading.refundRate = true;
            })
            .addCase(fetchRefundRate.fulfilled, (state, action) => {
                state.loading.refundRate = false;
                state.refundRate = action.payload;
            })
            .addCase(fetchRefundRate.rejected, (state, action) => {
                state.loading.refundRate = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchTransactionSummary.pending, (state) => {
                state.loading.transaction = true;
            })
            .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
                state.loading.transaction = false;
                state.transactionSummary = action.payload;
            })
            .addCase(fetchTransactionSummary.rejected, (state, action) => {
                state.loading.transaction = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchRevenueSummaryOrganizer.pending, (state) => {
                state.loading.organizerSummary = true;
            })
            .addCase(fetchRevenueSummaryOrganizer.fulfilled, (state, action) => {
                state.loading.organizerSummary = false;
                state.revenueSummaryOrganizer = action.payload;
            })
            .addCase(fetchRevenueSummaryOrganizer.rejected, (state, action) => {
                state.loading.organizerSummary = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchRevenueBreakdownOrganizer.pending, (state) => {
                state.loading.organizerBreakdown = true;
            })
            .addCase(fetchRevenueBreakdownOrganizer.fulfilled, (state, action) => {
                state.loading.organizerBreakdown = false;
                state.revenueBreakdownOrganizer = action.payload;
            })
            .addCase(fetchRevenueBreakdownOrganizer.rejected, (state, action) => {
                state.loading.organizerBreakdown = false;
                state.error = action.payload as string;
            });
    }
});

export default reportSlice.reducer;