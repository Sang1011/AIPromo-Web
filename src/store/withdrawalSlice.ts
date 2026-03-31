import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WithdrawalApiResponse, WithdrawalQueryParams, WithdrawalDetail } from "../types/withdrawal/withdrawal";
import withdrawalService from "../services/withdrawalService";

const name = "withdrawal";

interface WithdrawalState {
    withdrawalList: WithdrawalApiResponse | null;
    withdrawalDetail: WithdrawalDetail | null;
    loading: boolean;
    error: string | null;
}

const initialState: WithdrawalState = {
    withdrawalList: null,
    withdrawalDetail: null,
    loading: false,
    error: null,
};

export const fetchWithdrawalRequests = createAsyncThunk<
    WithdrawalApiResponse,
    WithdrawalQueryParams
>(
    `${name}/fetchWithdrawalRequests`,
    async (params, thunkAPI) => {
        try {
            const response = await withdrawalService.getAllWithdrawalRequests(params);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchWithdrawalDetail = createAsyncThunk<
    WithdrawalDetail,
    string
>(
    `${name}/fetchWithdrawalDetail`,
    async (id, thunkAPI) => {
        try {
            const response = await withdrawalService.getWithdrawalDetail(id);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

const withdrawalSlice = createSlice({
    name,
    initialState,
    reducers: {
        clearWithdrawalDetail: (state) => {
            state.withdrawalDetail = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWithdrawalRequests.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchWithdrawalRequests.fulfilled, (state, action: PayloadAction<WithdrawalApiResponse>) => {
            state.withdrawalList = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchWithdrawalRequests.rejected, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to fetch withdrawal requests";
        });
        builder.addCase(fetchWithdrawalDetail.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchWithdrawalDetail.fulfilled, (state, action: PayloadAction<WithdrawalDetail>) => {
            state.withdrawalDetail = action.payload;
            state.loading = false;
        });
        builder.addCase(fetchWithdrawalDetail.rejected, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload?.message || "Failed to fetch withdrawal detail";
        });
    },
});

export const { clearWithdrawalDetail } = withdrawalSlice.actions;

export default withdrawalSlice.reducer;
