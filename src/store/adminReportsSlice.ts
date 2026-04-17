import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import adminReportsService from "../services/adminReportsService";
import type {
    AdminReportsResponse,
    AdminReportsData,
    SalesTrendResponse,
    SalesTrendDataPoint,
    TopEventsResponse,
    TopEventItem,
} from "../types/adminReports/adminReports";

const name = "adminReports";

interface AdminReportsState {
    data: AdminReportsData | null;
    salesTrend: SalesTrendDataPoint[];
    topEvents: TopEventItem[];
    loading: boolean;
    error: string | null;
}

const initialState: AdminReportsState = {
    data: null,
    salesTrend: [],
    topEvents: [],
    loading: false,
    error: null,
};

export const fetchAdminReportsOverview = createAsyncThunk<AdminReportsResponse>(
    `${name}/fetchAdminReportsOverview`,
    async (_, thunkAPI) => {
        try {
            return (await adminReportsService.getOverview()).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchSalesTrend = createAsyncThunk<SalesTrendResponse, number>(
    `${name}/fetchSalesTrend`,
    async (days, thunkAPI) => {
        try {
            return (await adminReportsService.getSalesTrend(days)).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchTopEvents = createAsyncThunk<TopEventsResponse, number>(
    `${name}/fetchTopEvents`,
    async (top, thunkAPI) => {
        try {
            return (await adminReportsService.getTopEvents(top)).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

const adminReportsSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReportsOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminReportsOverview.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.isSuccess && action.payload.data) {
                    state.data = action.payload.data;
                }
            })
            .addCase(fetchAdminReportsOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch admin reports";
            })
            .addCase(fetchSalesTrend.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesTrend.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.isSuccess && action.payload.data) {
                    state.salesTrend = action.payload.data.chartData;
                }
            })
            .addCase(fetchSalesTrend.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch sales trend";
            })
            .addCase(fetchTopEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopEvents.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.isSuccess && action.payload.data) {
                    state.topEvents = action.payload.data.events;
                }
            })
            .addCase(fetchTopEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch top events";
            });
    },
});

export default adminReportsSlice.reducer;
