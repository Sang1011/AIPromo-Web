import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import userService from "../services/userService";
import type { UserItem, GetAllUsersResponse, GetAllUsersRequest } from "../types/user/user";
import type { ApiResponse } from "../types/user/user";

const name = "user";

interface UserState {
    users: UserItem[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPrevious: boolean;
        hasNext: boolean;
        currentStartIndex?: number;     
        currentEndIndex?: number;
    } | null;
    loading: boolean;
}

const initialState: UserState = {
    users: [],
    pagination: null,
    loading: false,
};

export const fetchAllUsers = createAsyncThunk<
    ApiResponse<GetAllUsersResponse>,
    GetAllUsersRequest
>(
    `${name}/fetchAllUsers`,
    async (params = {}, thunkAPI) => {
        try {
            const response = await userService.getAllUsers(params);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const updateUserStatus = createAsyncThunk<
    void,
    { userId: string; userStatus: "Active" | "Inactive" | "Banned" }
>(
    `${name}/updateUserStatus`,
    async ({ userId, userStatus }, thunkAPI) => {
        try {
            await userService.updateUserStatus(userId, userStatus);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const userSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<ApiResponse<GetAllUsersResponse>>) => {
                state.loading = false;
                state.users = action.payload.data.items;
                state.pagination = {
                    pageNumber: action.payload.data.pageNumber,
                    pageSize: action.payload.data.pageSize,
                    totalCount: action.payload.data.totalCount,
                    totalPages: action.payload.data.totalPages,
                    hasPrevious: action.payload.data.hasPrevious,
                    hasNext: action.payload.data.hasNext,
                    currentStartIndex: action.payload.data.currentStartIndex,
                    currentEndIndex: action.payload.data.currentEndIndex,
                };
            })
            .addCase(fetchAllUsers.rejected, (state) => {
                state.loading = false;
            })
            .addCase(updateUserStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateUserStatus.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default userSlice.reducer;