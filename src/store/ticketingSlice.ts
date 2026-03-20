import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ticketingService from "../services/ticketingService";
import type { CreatePendingOrderRequest } from "../types/ticketing/ticketing";
interface TicketingState {
    loading: boolean;
    error: string | null;
    orderId: string | null;
}

const initialState: TicketingState = {
    loading: false,
    error: null,
    orderId: null,
};

export const fetchCreatePendingOrder = createAsyncThunk<
    string,
    CreatePendingOrderRequest,
    { rejectValue: string }
>(
    "TICKETING/createPendingOrder",
    async (data, { rejectWithValue }) => {
        try {
            const res = await ticketingService.createPendingOrder(data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(
                err?.response?.data?.message ?? "Không thể tạo order"
            );
        }
    }
);

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
            .addCase(fetchCreatePendingOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchCreatePendingOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload;
            })

            .addCase(fetchCreatePendingOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Có lỗi xảy ra";
            });
    },
});

export const { resetTicketingState } = ticketingSlice.actions;

export default ticketingSlice.reducer;