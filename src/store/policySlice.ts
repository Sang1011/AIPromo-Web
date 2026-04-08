import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Policy, PolicyRequest } from "../types/policy/policy";
import policyService from "../services/policyService";

interface PolicyState {
    list: Policy[];
    detail: Policy | null;
    loading: {
        list: boolean;
        detail: boolean;
    };
    error: string | null;
}

const initialState: PolicyState = {
    list: [],
    detail: null,
    loading: {
        list: false,
        detail: false,
    },
    error: null,
};

export const fetchAllPolicies = createAsyncThunk(
    "policy/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const res = await policyService.getAllPolicies();
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const fetchPolicyById = createAsyncThunk(
    "policy/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await policyService.getPolicyById(id);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);


export const fetchPolicyUploadFile = createAsyncThunk(
    "policy/fetchPolicyUploadFile",
    async (data: { file: File }, { rejectWithValue }) => {
        try {
            const res = await policyService.postPolicyfile(data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);

export const fetchUploadPolicy = createAsyncThunk(
    "policy/fetchUploadPolicy",
    async (data: PolicyRequest, { rejectWithValue }) => {
        try {
            const res = await policyService.postPolicy(data);
            return res.data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Error");
        }
    }
);




const policySlice = createSlice({
    name: "policy",
    initialState,
    reducers: {
        clearDetail: (state) => {
            state.detail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPolicies.pending, (state) => {
                state.loading.list = true;
                state.error = null;
            })
            .addCase(fetchAllPolicies.fulfilled, (state, action) => {
                state.loading.list = false;
                state.list = action.payload;
            })
            .addCase(fetchAllPolicies.rejected, (state, action) => {
                state.loading.list = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPolicyById.pending, (state) => {
                state.loading.detail = true;
                state.error = null;
            })
            .addCase(fetchPolicyById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.detail = action.payload;
            })
            .addCase(fetchPolicyById.rejected, (state, action) => {
                state.loading.detail = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearDetail } = policySlice.actions;
export default policySlice.reducer;