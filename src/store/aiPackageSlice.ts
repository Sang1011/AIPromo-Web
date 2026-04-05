import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AIPackage, AIPurchasedPackage, AIQuota, PaymentPackageRequest } from "../types/aiPackage/aiPackage";
import aiPackageService from "../services/aiPackageService";

interface AIPackageState {
    list: AIPackage[];
    detail: AIPackage | null;
    quota: AIQuota | null;
    purchasedPackages: AIPurchasedPackage[];
    loading: {
        list: boolean;
        detail: boolean;
        quota: boolean;
        purchased: boolean;
        payment: boolean;
    };
    error: string | null;
}

const initialState: AIPackageState = {
    list: [],
    detail: null,
    quota: null,
    purchasedPackages: [],
    loading: {
        list: false,
        detail: false,
        quota: false,
        purchased: false,
        payment: false
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

export const fetchMyQuota = createAsyncThunk(
    "aiQuota/fetchMyQuota",
    async (_, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.getMyQuota();
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const fetchPurchasedPackages = createAsyncThunk(
    "aiQuota/fetchPurchasedPackages",
    async (_, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.getPurchasedPackages();
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

export const createPaymentPackageThunk = createAsyncThunk(
    "aiPackage/createPayment",
    async (body: PaymentPackageRequest, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.createPaymentPackage(body);
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
            })
            .addCase(fetchMyQuota.pending, (state) => {
                state.loading.quota = true;
                state.error = null;
            })
            .addCase(fetchMyQuota.fulfilled, (state, action) => {
                state.loading.quota = false;
                state.quota = action.payload;
            })
            .addCase(fetchMyQuota.rejected, (state, action) => {
                state.loading.quota = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPurchasedPackages.pending, (state) => {
                state.loading.purchased = true;
                state.error = null;
            })
            .addCase(fetchPurchasedPackages.fulfilled, (state, action) => {
                state.loading.purchased = false;
                state.purchasedPackages = action.payload;
            })
            .addCase(fetchPurchasedPackages.rejected, (state, action) => {
                state.loading.purchased = false;
                state.error = action.payload as string;
            })
            .addCase(createPaymentPackageThunk.pending, (state) => {
                state.loading.payment = true;
                state.error = null;
            })
            .addCase(createPaymentPackageThunk.fulfilled, (state) => {
                state.loading.payment = false;

            })
            .addCase(createPaymentPackageThunk.rejected, (state, action) => {
                state.loading.payment = false;
                state.error = action.payload as string;
            });
    },
});

// =======================
export const { clearDetail } = aiPackageSlice.actions;
export default aiPackageSlice.reducer;