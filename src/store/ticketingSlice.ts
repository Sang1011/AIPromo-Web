import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ticketingService from "../services/ticketingService";
import type { ApiResponse } from "../types/api";
import type {
    CheckInStatistic,
    CreatePendingOrderRequest,
    GetOrdersRequest,
    GetSalesTrendRequest,
    OrderItemOrganizer,
    OverviewStatistic,
    PaginatedOrders,
    SalesTrendData,
    StatisticCheckInResponse,
    StatisticOverviewResponse,
    StatisticSalesTrendResponse,
} from "../types/ticketing/ticketing";

interface TicketingState {
    loading: boolean;
    error: string | null;
    orderId: string | null;
    checkInStats: CheckInStatistic | null;
    overviewStats: OverviewStatistic | null;
    salesTrend: SalesTrendData | null;
    salesTrendLoading: boolean;
    orders: OrderItemOrganizer[];
    pagination: {
        pageNumber: number;
        totalPages: number;
        totalCount: number;
    };
}

const initialState: TicketingState = {
    loading: false,
    error: null,
    orderId: null,
    checkInStats: null,
    overviewStats: null,
    salesTrend: null,
    salesTrendLoading: false,
    orders: [],
    pagination: {
        pageNumber: 1,
        totalPages: 0,
        totalCount: 0,
    },
};

export const fetchCreatePendingOrder = createAsyncThunk<
    ApiResponse<string>,
    CreatePendingOrderRequest,
    { rejectValue: string }
>("TICKETING/createPendingOrder", async (data, { rejectWithValue }) => {
    try {
        const res = await ticketingService.createPendingOrder(data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message ?? "Không thể tạo order");
    }
});

export const fetchOrdersByOrganizer = createAsyncThunk<
    ApiResponse<PaginatedOrders>,
    GetOrdersRequest,
    { rejectValue: string }
>("TICKETING/fetchOrdersByOrganizer", async (params, { rejectWithValue }) => {
    try {
        const res = await ticketingService.getAllOrderByCurrentOrganizer(params);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? "Không thể lấy danh sách orders"
        );
    }
});

export const fetchCheckInOrganizerStats = createAsyncThunk<
    StatisticCheckInResponse,
    { eventId: string; sessionId: string },
    { rejectValue: string }
>("TICKETING/fetchCheckInOrganizerStats", async ({ eventId, sessionId }, { rejectWithValue }) => {
    try {
        const res = await ticketingService.getCheckInStats(eventId, sessionId);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? "Không thể lấy thống kê check-in"
        );
    }
});

export const fetchOverviewOrganizerStats = createAsyncThunk<
    StatisticOverviewResponse,
    { eventId: string },
    { rejectValue: string }
>("TICKETING/fetchOverviewOrganizerStats", async ({ eventId }, { rejectWithValue }) => {
    try {
        const res = await ticketingService.getOverviewStats(eventId);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? "Không thể lấy thống kê tổng quan"
        );
    }
});

export const fetchSalesTrend = createAsyncThunk<
    StatisticSalesTrendResponse,
    GetSalesTrendRequest,
    { rejectValue: string }
>("TICKETING/fetchSalesTrend", async (params, { rejectWithValue }) => {
    try {
        const res = await ticketingService.getSalesTrend(params);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? "Không thể lấy dữ liệu xu hướng bán vé"
        );
    }
});

const ticketingSlice = createSlice({
    name: "TICKETING",
    initialState,
    reducers: {
        resetTicketingState: (state) => {
            state.loading = false;
            state.error = null;
            state.orderId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // createPendingOrder
            .addCase(fetchCreatePendingOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCreatePendingOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload.data;
            })
            .addCase(fetchCreatePendingOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            })

            // fetchOrdersByOrganizer
            .addCase(fetchOrdersByOrganizer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrdersByOrganizer.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload.data;
                state.orders = data.items;
                state.pagination = {
                    pageNumber: data.pageNumber,
                    totalPages: data.totalPages,
                    totalCount: data.totalCount,
                };
            })
            .addCase(fetchOrdersByOrganizer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            })

            // fetchCheckInOrganizerStats
            .addCase(fetchCheckInOrganizerStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCheckInOrganizerStats.fulfilled, (state, action) => {
                state.loading = false;
                state.checkInStats = action.payload.data;
            })
            .addCase(fetchCheckInOrganizerStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            })

            // fetchOverviewOrganizerStats
            .addCase(fetchOverviewOrganizerStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverviewOrganizerStats.fulfilled, (state, action) => {
                state.loading = false;
                state.overviewStats = action.payload.data;
            })
            .addCase(fetchOverviewOrganizerStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            })

            // fetchSalesTrend
            .addCase(fetchSalesTrend.pending, (state) => {
                state.salesTrendLoading = true;
                state.error = null;
            })
            .addCase(fetchSalesTrend.fulfilled, (state, action) => {
                state.salesTrendLoading = false;
                state.salesTrend = action.payload.data;
            })
            .addCase(fetchSalesTrend.rejected, (state, action) => {
                state.salesTrendLoading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            });
    },
});

export const { resetTicketingState } = ticketingSlice.actions;
export default ticketingSlice.reducer;