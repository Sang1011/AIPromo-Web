import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import adminEventReportService from "../services/adminEventReportService";
import type {
    EventRevenueDetailData,
    GetEventRevenueDetailResponse,
} from "../types/adminEvent/adminEventReport";

const name = "adminEventReport";

interface AdminEventReportState {
    revenueDetail: EventRevenueDetailData | null;
    currentEventId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminEventReportState = {
    revenueDetail: null,
    currentEventId: null,
    loading: false,
    error: null,
};

export const fetchEventRevenueDetail = createAsyncThunk<
    { data: EventRevenueDetailData; eventId: string },
    string
>(
    `${name}/fetchEventRevenueDetail`,
    async (eventId, thunkAPI) => {
        try {
            const response = await adminEventReportService.getEventRevenueDetail(eventId);
            const result: GetEventRevenueDetailResponse = response.data;
            if (!result.isSuccess || !result.data) {
                return thunkAPI.rejectWithValue(result.message ?? "Không thể tải doanh thu");
            }
            return { data: result.data, eventId };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message ?? error?.message ?? "Không thể tải doanh thu"
            );
        }
    }
);

const adminEventReportSlice = createSlice({
    name,
    initialState,
    reducers: {
        clearRevenueDetail: (state) => {
            state.revenueDetail = null;
            state.currentEventId = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventRevenueDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.revenueDetail = null;
            })
            .addCase(
                fetchEventRevenueDetail.fulfilled,
                (state, action: PayloadAction<{ data: EventRevenueDetailData; eventId: string }>) => {
                    state.loading = false;
                    state.revenueDetail = action.payload.data;
                    state.currentEventId = action.payload.eventId;
                }
            )
            .addCase(fetchEventRevenueDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) ?? action.error.message ?? "Lỗi không xác định";
            });
    },
});

export const { clearRevenueDetail } = adminEventReportSlice.actions;
export default adminEventReportSlice.reducer;
