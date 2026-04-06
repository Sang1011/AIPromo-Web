import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import eventService from "../services/eventService";
import type { CancelledEventsData, GetCancelledEventsRequest } from "../types/event/cancelledEvent";
import type { MassRefundResponse } from "../types/refund/massRefund";

const name = "cancelledEvent";

interface CancelledEventState {
    cancelledEvents: CancelledEventsData | null;
    loading: boolean;
    error: string | null;
    refundLoading: boolean;
}

const initialState: CancelledEventState = {
    cancelledEvents: null,
    loading: false,
    error: null,
    refundLoading: false,
};

export const fetchCancelledEvents = createAsyncThunk<
    CancelledEventsData,
    GetCancelledEventsRequest
>(
    `${name}/fetchCancelledEvents`,
    async (params, thunkAPI) => {
        try {
            const response = await eventService.getCancelledEvents(params);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const massRefund = createAsyncThunk<
    MassRefundResponse,
    string
>(
    `${name}/massRefund`,
    async (eventId, thunkAPI) => {
        try {
            const response = await eventService.massRefund(eventId);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const cancelledEventSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchCancelledEvents.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCancelledEvents.fulfilled, (state, action: PayloadAction<CancelledEventsData>) => {
            state.cancelledEvents = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchCancelledEvents.rejected, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload?.message || "Không thể tải danh sách sự kiện đã hủy";
        });
        builder.addCase(massRefund.pending, (state) => {
            state.refundLoading = true;
        });
        builder.addCase(massRefund.fulfilled, (state) => {
            state.refundLoading = false;
        });
        builder.addCase(massRefund.rejected, (state) => {
            state.refundLoading = false;
        });
    },
});

export default cancelledEventSlice.reducer;
