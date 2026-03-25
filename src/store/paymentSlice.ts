import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {  PaymentHistoryParamsRequest, PaymentMyOrderResponse, PaymentOrderPaymentRequest, PaymentOrderPaymentResponse } from "../types/payment/payment";
import paymentService from "../services/paymentService";


const name = "payment";

interface PaymentState {
    paymentOrder: PaymentOrderPaymentResponse | null;
    paymentAllOrder: PaymentMyOrderResponse | null;
}

const initialState: PaymentState = {
    paymentOrder: null,
    paymentAllOrder: null,
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


const paymentSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(fetchPaymentOrder.fulfilled, (state, action: PayloadAction<any>) => {
           const response = action.payload;
           if (response?.isSuccess) {
               state.paymentOrder = response.data;
           }
      });
          builder.addCase(fetchPaymentMyAllOrder.fulfilled, (state, action: PayloadAction<any>) => {
           const response = action.payload;
           if (response?.isSuccess) {
               state.paymentAllOrder = response.data;
           }
      });
     }
})

export default paymentSlice.reducer;