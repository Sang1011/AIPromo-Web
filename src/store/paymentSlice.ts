import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AdminPaymentTransactionsData, AdminPaymentTransactionsResponse, PaymentHistoryParamsRequest, PaymentMyOrderResponse, PaymentOrderPaymentRequest, PaymentOrderPaymentResponse, PaymentTransactionDetailResponse, PaymentTransactionDetail } from "../types/payment/payment";
import paymentService from "../services/paymentService";



const name = "payment";

interface PaymentState {
    paymentOrder: PaymentOrderPaymentResponse | null;
    paymentAllOrder: PaymentMyOrderResponse | null;
    adminTransactions: AdminPaymentTransactionsData | null;
    paymentDetail: PaymentTransactionDetail | null;
    loading: {
        order: boolean;
        myOrders: boolean;
        adminTransactions: boolean;
        paymentDetail: boolean;
    };
    error: string | null;
}

const initialState: PaymentState = {
    paymentOrder: null,
    paymentAllOrder: null,
    adminTransactions: null,
    paymentDetail: null,
    loading: {
        order: false,
        myOrders: false,
        adminTransactions: false,
        paymentDetail: false,
    },
    error: null,
};

export const fetchPaymentOrder = createAsyncThunk<
    PaymentOrderPaymentResponse,
    PaymentOrderPaymentRequest
>(
    `${name}/fetchPaymentOrder`,
    async (data: PaymentOrderPaymentRequest, thunkAPI) => {
        try {
            const response = await paymentService.paymentOrder(data)
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);


export const fetchPaymentMyAllOrder = createAsyncThunk<
    PaymentMyOrderResponse,
    PaymentHistoryParamsRequest
>(
    `${name}/fetchPaymentMyAllOrder`,
    async (data: PaymentHistoryParamsRequest, thunkAPI) => {
        try {
            const response = await paymentService.paymentOrderHistory(data)
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchAdminPaymentTransactions = createAsyncThunk<
    AdminPaymentTransactionsResponse,
    {
        PageNumber: number;
        PageSize: number;
        SortColumn?: string;
        SortOrder?: string;
        UserId?: string;
        OrderId?: string;
        EventId?: string;
        Type?: string;
        Status?: string;
        AmountMin?: number;
        AmountMax?: number;
        CreatedFrom?: string;
        CreatedTo?: string;
        GatewayTxnRef?: string;
    }
>(
    `${name}/fetchAdminPaymentTransactions`,
    async (params, thunkAPI) => {
        try {
            const response = await paymentService.getAdminPaymentTransactions(params);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch transactions");
        }
    }
);

export const fetchPaymentById = createAsyncThunk<
    PaymentTransactionDetailResponse,
    string
>(
    `${name}/fetchPaymentById`,
    async (id, thunkAPI) => {
        try {
            const response = await paymentService.getPaymentById(id);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch payment detail");
        }
    }
);


const paymentSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(fetchPaymentOrder.fulfilled, (state, action: PayloadAction<any>) => {
           const response = action.payload;
           state.paymentOrder = response.data;

      });
      builder.addCase(fetchPaymentMyAllOrder.fulfilled, (state, action: PayloadAction<any>) => {
           const response = action.payload;
           if (response?.isSuccess) {
               state.paymentAllOrder = response.data;
           }
      });
      builder
        .addCase(fetchAdminPaymentTransactions.pending, (state) => {
            state.loading.adminTransactions = true;
            // keep previous `adminTransactions` while loading to avoid empty UI during quick navigation
            state.error = null;
        })
        .addCase(fetchAdminPaymentTransactions.fulfilled, (state, action: PayloadAction<AdminPaymentTransactionsResponse>) => {
            state.loading.adminTransactions = false;
            if (action.payload?.isSuccess && action.payload.data) {
                state.adminTransactions = action.payload.data;
            }
        })
        .addCase(fetchAdminPaymentTransactions.rejected, (state, action) => {
            state.loading.adminTransactions = false;
            state.error = action.payload as string;
        });
        builder
        .addCase(fetchPaymentById.pending, (state) => {
            state.loading.paymentDetail = true;
            state.error = null;
        })
        .addCase(fetchPaymentById.fulfilled, (state, action: PayloadAction<PaymentTransactionDetailResponse>) => {
            state.loading.paymentDetail = false;
            if (action.payload?.isSuccess && action.payload.data) {
                state.paymentDetail = action.payload.data;
            }
        })
        .addCase(fetchPaymentById.rejected, (state, action) => {
            state.loading.paymentDetail = false;
            state.error = action.payload as string;
        });
     }
})

export default paymentSlice.reducer;