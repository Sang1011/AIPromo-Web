import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { WithdrawalRequest } from "../types/withdrawal/withdrawal";
import withdrawalService from "../services/withdrawalService";

const name = "withdrawal";

interface withdrawalState {
  
}

const initialState: withdrawalState = {
    
}

export const fetchCreateWithdrawal = createAsyncThunk<string, WithdrawalRequest >(
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
    reducers:{},
    extraReducers: (builder) => {
       
    }
})

export default withdrawalSlice.reducer;