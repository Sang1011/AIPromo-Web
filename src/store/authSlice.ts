import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import authService from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../types/auth/auth";


const name = "auth";

interface AuthState {
   token: string | null;
   currentInfor: object;
}

const initialState: AuthState = {
   token: null,
   currentInfor: {}
};

export const fetchLogin = createAsyncThunk<
   any,
   LoginRequest
>(
   `${name}/fetchLogin`,
   async (params, thunkAPI) => {
      try {
         const response = await authService.login(params);
         return response.data;
      } catch (error) {
         return thunkAPI.rejectWithValue(error);
      }
   }
);

export const fetchLoginGoogle = createAsyncThunk(`${name}/fetchLoginGoogle`, async (data: object, thunkAPI) => {
   try {
      const response = await authService.loginGoogle(data);
      return response.data;
   } catch (error) {
      return thunkAPI.rejectWithValue(error);
   }
})

export const fetchRegister = createAsyncThunk<
   any,
   RegisterRequest
>(
   `${name}/fetchLogin`,
   async (params, thunkAPI) => {
      try {
         const response = await authService.register(params);
         return response.data;
      } catch (error) {
         return thunkAPI.rejectWithValue(error);
      }
   }
);

export const fetchMe = createAsyncThunk(
  `${name}/fetchMe`,
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");

      if (!token) {
        return thunkAPI.rejectWithValue("Token not found");
      }
      const response = await authService.fetchWithMe(token);  
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
   name,
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder.addCase(fetchLogin.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            const token = responseData.data.accessToken;
            state.currentInfor = responseData.data.user;
            state.token = token;
            if (token) {
               localStorage.setItem("ACCESS_TOKEN", token);
            }
         }
      });
      builder.addCase(fetchLoginGoogle.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            const token = responseData.data.accessToken;
            state.currentInfor = responseData.data.user;
            state.token = token;
            if (token) {
               localStorage.setItem("ACCESS_TOKEN", token);
            }
         }
      });
      builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            state.currentInfor = responseData.data;
         }
      });
   },
});

export default authSlice.reducer;