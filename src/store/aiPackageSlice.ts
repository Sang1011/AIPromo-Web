import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AIPackage, AIPurchasedPackage, AIQuota, PaymentPackageRequest, AIPackageOverview } from "../types/aiPackage/aiPackage";
import aiPackageService from "../services/aiPackageService";

interface AIPackageState {
    list: AIPackage[];
    detail: AIPackage | null;
    quota: AIQuota | null;
    purchasedPackages: AIPurchasedPackage[];
    overview: AIPackageOverview | null;
    loading: {
        list: boolean;
        detail: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        toggleStatus: boolean;
        quota: boolean;
        purchased: boolean;
        payment: boolean;
        overview: boolean;
    };
    error: string | null;
}

const initialState: AIPackageState = {
    list: [],
    detail: null,
    quota: null,
    purchasedPackages: [],
    overview: null,
    loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        delete: false,
        toggleStatus: false,
        quota: false,
        purchased: false,
        payment: false,
        overview: false
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

export const createAIPackage = createAsyncThunk(
    "aiPackage/create",
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.createAIPackage(payload);
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

export const updateAIPackage = createAsyncThunk(
    "aiPackage/update",
    async ({ id, payload }: { id: string; payload: any }, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.updateAIPackage(id, payload);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const deleteAIPackage = createAsyncThunk(
    "aiPackage/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await aiPackageService.deleteAIPackage(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const togglePackageStatus = createAsyncThunk(
    "aiPackage/toggleStatus",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.togglePackageStatus(id);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const fetchAIPackageOverview = createAsyncThunk(
    "aiPackage/fetchOverview",
    async (_, { rejectWithValue }) => {
        try {
            const res = await aiPackageService.getAIPackageOverview();
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
            // ===== CREATE =====
            .addCase(createAIPackage.pending, (state) => {
                state.loading.create = true;
                state.error = null;
            })
            .addCase(createAIPackage.fulfilled, (state, action) => {
                state.loading.create = false;
                // prepend new package to list
                state.list = [action.payload, ...state.list];
            })
            .addCase(createAIPackage.rejected, (state, action) => {
                state.loading.create = false;
                state.error = action.payload as string;
            })
            // ===== UPDATE =====
            .addCase(updateAIPackage.pending, (state) => {
                state.loading.update = true;
                state.error = null;
            })
            .addCase(updateAIPackage.fulfilled, (state, action) => {
                state.loading.update = false;
                // update the package in list
                const idx = state.list.findIndex((p) => p.id === action.payload.id);
                if (idx !== -1) {
                    state.list[idx] = action.payload;
                }
            })
            .addCase(updateAIPackage.rejected, (state, action) => {
                state.loading.update = false;
                state.error = action.payload as string;
            })
            // ===== DELETE =====
            .addCase(deleteAIPackage.pending, (state) => {
                state.loading.delete = true;
                state.error = null;
            })
            .addCase(deleteAIPackage.fulfilled, (state, action) => {
                state.loading.delete = false;
                state.list = state.list.filter((p) => p.id !== action.payload);
            })
            .addCase(deleteAIPackage.rejected, (state, action) => {
                state.loading.delete = false;
                state.error = action.payload as string;
            })
            // ===== TOGGLE STATUS =====
            .addCase(togglePackageStatus.pending, (state) => {
                state.loading.toggleStatus = true;
                state.error = null;
            })
            .addCase(togglePackageStatus.fulfilled, (state, action) => {
                state.loading.toggleStatus = false;
                const idx = state.list.findIndex((p) => p.id === action.payload.id);
                if (idx !== -1) {
                    state.list[idx] = action.payload;
                }
            })
            .addCase(togglePackageStatus.rejected, (state, action) => {
                state.loading.toggleStatus = false;
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
            })
            .addCase(fetchAIPackageOverview.pending, (state) => {
                state.loading.overview = true;
                state.error = null;
            })
            .addCase(fetchAIPackageOverview.fulfilled, (state, action) => {
                state.loading.overview = false;
                state.overview = action.payload;
            })
            .addCase(fetchAIPackageOverview.rejected, (state, action) => {
                state.loading.overview = false;
                state.error = action.payload as string;
            });
    },
});

// =======================
export const { clearDetail } = aiPackageSlice.actions;
export default aiPackageSlice.reducer;