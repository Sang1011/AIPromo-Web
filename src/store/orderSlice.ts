import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GetAllOrderRequest, GetAllOrderResponse, GetDetailOrderResponse } from "../types/order/order";
import orderService from "../services/orderService";

const name = "order";

interface OrderState {
    orderDetail: GetDetailOrderResponse | null;
    allOrder: GetAllOrderResponse | null;
}

const initialState: OrderState = {
    orderDetail: null,
    allOrder: null
};

export const fetchGetDetailOrder = createAsyncThunk<
    GetDetailOrderResponse,
    string
>(
    `${name}/fetchGetDetailOrder`,
    async (orderId, thunkAPI) => {
        try {
            const response = await orderService.getDetailOrder(orderId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchGetAllOrder = createAsyncThunk<
    GetAllOrderResponse,
    GetAllOrderRequest
>(
    `${name}/fetchGetAllOrder`,
    async (data, thunkAPI) => {
        try {
            const response = await orderService.getAllOrder(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);



const orderSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchGetDetailOrder.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.orderDetail = action.payload.data;
            }
        );
        builder.addCase(
            fetchGetAllOrder.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.allOrder = action.payload.data;
            }
        );
    },
});

export default orderSlice.reducer;