import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import authService from "../services/authService";
import type { LoginRequest, RegisterRequest } from "../types/auth/auth";


const name = "auth";

interface AuthState {
   token: string | null;
   refreshToken: string | null;
   deviceId: string | null;
   currentInfor: object;
   userDetail: object
}


const initialState: AuthState = {
   token: null,
   refreshToken: null,
   deviceId: null,
   currentInfor: {},
   userDetail: {}
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
      console.log(response.data);
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
)

export const fetchRefreshToken = createAsyncThunk(
   `${name}/refreshToken`,
   async (_, thunkAPI) => {
      try {
         const accessToken = localStorage.getItem("ACCESS_TOKEN");
         const refreshToken = localStorage.getItem("REFRESH_TOKEN");
         const deviceId = localStorage.getItem("DEVICE_ID");
         const response = await authService.refreshToken({
            accessToken,
            refreshToken,
            deviceId: deviceId,
         });

         return response.data;

      } catch (error: any) {
         return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
   }
);

export const fetchUserDetail = createAsyncThunk<
   any,
   string
>(
   `${name}/fetchUserDetail`,
   async (id, thunkAPI) => {
      try {
         const response = await authService.userDetail(id);
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
            const refreshToken = responseData.data.refreshToken;
            const deviceId = responseData.data.deviceId;

            state.token = token;
            state.refreshToken = refreshToken;
            state.deviceId = deviceId;
            state.currentInfor = responseData.data.user;

            localStorage.setItem("ACCESS_TOKEN", token);
            localStorage.setItem("REFRESH_TOKEN", refreshToken);
            localStorage.setItem("DEVICE_ID", deviceId);
         }
      });
      builder.addCase(fetchLoginGoogle.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            const token = responseData.data.accessToken;
            const refreshToken = responseData.data.refreshToken;
            const deviceId = responseData.data.deviceId;

            state.token = token;
            state.refreshToken = refreshToken;
            state.deviceId = deviceId;
            state.currentInfor = responseData.data.user;

            localStorage.setItem("ACCESS_TOKEN", token);
            localStorage.setItem("REFRESH_TOKEN", refreshToken);
            localStorage.setItem("DEVICE_ID", deviceId);
         }
      });
      builder.addCase(fetchMe.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            state.currentInfor = responseData.data;
         }
      });
      builder.addCase(fetchRefreshToken.fulfilled, (state, action: PayloadAction<any>) => {

         const responseData = action.payload;
         if (responseData?.isSuccess) {
            const token = responseData.data.accessToken;
            const refreshToken = responseData.data.refreshToken;
            const deviceId = responseData.data.deviceId;

            state.token = token;
            state.refreshToken = refreshToken;
            state.deviceId = deviceId;
            state.currentInfor = responseData.data.user;

            localStorage.setItem("ACCESS_TOKEN", token);
            localStorage.setItem("REFRESH_TOKEN", refreshToken);
            localStorage.setItem("DEVICE_ID", deviceId);
         }

      });
      builder.addCase(fetchUserDetail.fulfilled, (state, action: PayloadAction<any>) => {
         const responseData = action.payload;
         if (responseData?.isSuccess) {
            state.userDetail = responseData.data;
         }
      });
   },
});

export default authSlice.reducer;