import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WithdrawalApiResponse, WithdrawalQueryParams, WithdrawalDetail, CreateWithdrawal } from "../types/withdrawal/withdrawal";
import type { WithdrawalRequest } from "../types/withdrawal/withdrawal";
import withdrawalService from "../services/withdrawalService";

const name = "withdrawal";

interface WithdrawalState {
    withdrawalList: WithdrawalApiResponse | null;
    withdrawalDetail: WithdrawalDetail | null;
    loading: boolean;
    error: string | null;
    actionLoading: boolean;
}

const initialState: WithdrawalState = {
    withdrawalList: null,
    withdrawalDetail: null,
    loading: false,
    error: null,
    actionLoading: false,
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

export const approveWithdrawal = createAsyncThunk<
    void,
    { id: string; adminNote: string }
>(
    `${name}/approveWithdrawal`,
    async ({ id, adminNote }, thunkAPI) => {
        try {
            await withdrawalService.approveWithdrawal(id, { adminNote });
            // Refetch the withdrawal detail to get updated status
            thunkAPI.dispatch(fetchWithdrawalDetail(id));
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const rejectWithdrawal = createAsyncThunk<
    void,
    { id: string; adminNote: string }
>(
    `${name}/rejectWithdrawal`,
    async ({ id, adminNote }, thunkAPI) => {
        try {
            await withdrawalService.rejectWithdrawal(id, { adminNote });
            thunkAPI.dispatch(fetchWithdrawalDetail(id));
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const completeWithdrawal = createAsyncThunk<
    void,
    { id: string; adminNote: string }
>(
    `${name}/completeWithdrawal`,
    async ({ id, adminNote }, thunkAPI) => {
        try {
            await withdrawalService.completeWithdrawal(id, { adminNote });
            thunkAPI.dispatch(fetchWithdrawalDetail(id));
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchCreateWithdrawal = createAsyncThunk<string, CreateWithdrawal >(
    `${name}/fetchCreateWithdrawal`,
    async(data, thunkAPI) => {
        try {
          const response = await withdrawalService.createWithdrawal(data)
            return response.data;
        } catch (error: any) {
               return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
)


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
        builder.addCase(approveWithdrawal.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(approveWithdrawal.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(approveWithdrawal.rejected, (state, action: PayloadAction<any>) => {
            state.actionLoading = false;
            state.error = action.payload?.message || "Failed to approve withdrawal";
        });
        builder.addCase(rejectWithdrawal.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(rejectWithdrawal.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(rejectWithdrawal.rejected, (state, action: PayloadAction<any>) => {
            state.actionLoading = false;
            state.error = action.payload?.message || "Failed to reject withdrawal";
        });
        builder.addCase(completeWithdrawal.pending, (state) => {
            state.actionLoading = true;
        });
        builder.addCase(completeWithdrawal.fulfilled, (state) => {
            state.actionLoading = false;
        });
        builder.addCase(completeWithdrawal.rejected, (state, action: PayloadAction<any>) => {
            state.actionLoading = false;
            state.error = action.payload?.message || "Failed to complete withdrawal";
        });
    },
});

export const { clearWithdrawalDetail } = withdrawalSlice.actions;

export default withdrawalSlice.reducer;
