import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AIPackage } from "../types/aiPackage";
import aiPackageService from "../services/aiPackageService";

interface AIPackageState {
    list: AIPackage[];
    detail: AIPackage | null;
    loading: {
        list: boolean;
        detail: boolean;
    };
    error: string | null;
}

const initialState: AIPackageState = {
    list: [],
    detail: null,
    loading: {
        list: false,
        detail: false,
    },
    error: null,
};

export const fetchAIPackages = createAsyncThunk(
    "aiPackage/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.getAllAIPackages();
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const fetchAIPackageById = createAsyncThunk(
    "aiPackage/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.getAIPackageById(id);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

const aiPackageSlice = createSlice({
    name: "aiPackage",
    initialState,
    reducers: {
        clearDetail: (state) => {
            state.detail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAIPackages.pending, (state) => {
                state.loading.list = true;
                state.error = null;
            })
            .addCase(fetchAIPackages.fulfilled, (state, action) => {
                state.loading.list = false;
                state.list = action.payload;
            })
            .addCase(fetchAIPackages.rejected, (state, action) => {
                state.loading.list = false;
                state.error = action.payload as string;
            })
            .addCase(fetchAIPackageById.pending, (state) => {
                state.loading.detail = true;
                state.error = null;
            })
            .addCase(fetchAIPackageById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.detail = action.payload;
            })
            .addCase(fetchAIPackageById.rejected, (state, action) => {
                state.loading.detail = false;
                state.error = action.payload as string;
            });
    },
});

// =======================
export const { clearDetail } = aiPackageSlice.actions;
export default aiPackageSlice.reducer;