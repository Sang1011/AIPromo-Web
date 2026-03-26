import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ToUpWalletResponse, ToUpWalletResquest, WalletUserResponse } from "../types/wallet/wallet";
import walletService from "../services/walletService";

const name = "wallet";

interface walletState {
    currentWallet: WalletUserResponse | null;
    toUpWallet: ToUpWalletResponse | null;
}

const initialState: walletState = {
    currentWallet: null,
    toUpWallet: null,
}

export const fetchWalletUser = createAsyncThunk<WalletUserResponse, number>(
    `${name}/fetchWalletUser`,
    async (limit, thunkAPI) => {
        try {
            const response = await walletService.getWalletUser(limit);
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const fetchToUpWallet = createAsyncThunk<
    ToUpWalletResponse,
    ToUpWalletResquest
>(
    `${name}/fetchToUpWallet`,
    async (data, thunkAPI) => {
        try {
            const response = await walletService.topUpWalletUser(data);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
);
const walletSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchWalletUser.fulfilled, (state, action: PayloadAction<any>) => {
            const response = action.payload
            state.currentWallet = response.data
        })
         builder.addCase(fetchToUpWallet.fulfilled, (state, action: PayloadAction<any>) => {
            const response = action.payload
            state.toUpWallet = response.data
        })
    }
})

export default walletSlice.reducer;