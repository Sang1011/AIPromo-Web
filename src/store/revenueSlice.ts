import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GlobalRevenueApiResponse } from "../types/revenue/revenue";
import revenueService from "../services/revenueService";

const name = "revenue";

interface RevenueState {
    globalRevenue: GlobalRevenueApiResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: RevenueState = {
    globalRevenue: null,
    loading: false,
    error: null,
};

export const fetchGlobalRevenue = createAsyncThunk<
    GlobalRevenueApiResponse
>(
    `${name}/fetchGlobalRevenue`,
    async (_, thunkAPI) => {
        try {
            const response = await revenueService.getGlobalRevenue();
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const revenueSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchGlobalRevenue.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchGlobalRevenue.fulfilled, (state, action: PayloadAction<GlobalRevenueApiResponse>) => {
            state.globalRevenue = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchGlobalRevenue.rejected, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to fetch global revenue";
        });
    },
});

export default revenueSlice.reducer;
