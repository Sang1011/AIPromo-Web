import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import organizerProfileService from "../services/organizerProfileService";
import type {
    CreateProfileOrganizerRequest,
    GetOrganizerProfileResponse,
    OrganizerProfile,
    OrganizerProfileDetail,
    GetPendingOrganizersResponse,
    PendingOrganizerItem,
} from "../types/organizerProfile/organizerProfile";
import type { ApiResponse } from "../types/api";

const name = "organizerProfile";

interface OrganizerProfileState {
    profile: OrganizerProfile | null;
    profileDetail: OrganizerProfileDetail | null;
    pendingOrganizers: PendingOrganizerItem[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPrevious: boolean;
        hasNext: boolean;
    } | null;
    selectedOrganizerDetail: OrganizerProfileDetail | null;
}

const initialState: OrganizerProfileState = {
    profile: null,
    profileDetail: null,
    pendingOrganizers: [],
    pagination: null,
    selectedOrganizerDetail: null,
};

export const fetchOrganizerProfile = createAsyncThunk<GetOrganizerProfileResponse, void>(
    `${name}/fetchOrganizerProfile`,
    async (_, thunkAPI) => {
        try {
            const response = await organizerProfileService.getProfile();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateOrganizerDraftLogo = createAsyncThunk<
    ApiResponse<string>,
    { userId: string; file: File }
>(
    `${name}/fetchUpdateOrganizerDraftLogo`,
    async ({ userId, file }, thunkAPI) => {
        try {
            const response = await organizerProfileService.updateOrganizerDraftLogo(userId, file);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data || error.message);
        }
    }
);

export const fetchGetOrganizerProfileDetailById = createAsyncThunk<ApiResponse<OrganizerProfileDetail>, string>(
    `${name}/fetchGetOrganizerProfileDetailById`,
    async (userId, thunkAPI) => {
        try {
            const response = await organizerProfileService.getOrganizerProfileDetailById(userId);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data || error.message);
        }
    }
);

export const fetchCreateProfileOrganizer = createAsyncThunk<any, CreateProfileOrganizerRequest>(
    `${name}/fetchCreateProfileOrganizer`,
    async (data, thunkAPI) => {
        try {
            const response = await organizerProfileService.createProfile(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchVerifyProfileOrganizer = createAsyncThunk<
    any,
    void
>(
    `${name}/fetchVerifyProfileOrganizer`,
    async (_, thunkAPI) => {
        try {
            const response = await organizerProfileService.verifyProfile();
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPendingOrganizers = createAsyncThunk<
    GetPendingOrganizersResponse,
    {
        PageNumber: number;
        PageSize: number;
        SortColumn: string;
        SortOrder: string;
        Keyword?: string;
        BusinessType?: string;
    }
>(
    `${name}/fetchPendingOrganizers`,
    async (params, thunkAPI) => {
        try {
            const response = await organizerProfileService.getPendingOrganizers(params);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data || error.message);
        }
    }
);

export const fetchGetOrganizerDetail = createAsyncThunk<ApiResponse<OrganizerProfileDetail>, string>(
    `${name}/fetchGetOrganizerDetail`,
    async (userId, thunkAPI) => {
        try {
            const response = await organizerProfileService.getOrganizerDetail(userId);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data || error.message);
        }
    }
);
const organizerProfileSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchOrganizerProfile.fulfilled,
            (state, action: PayloadAction<GetOrganizerProfileResponse>) => {
                if (action.payload?.isSuccess) {
                    state.profile = action.payload.data;
                }
            }
        )
            .addCase(
                fetchUpdateOrganizerDraftLogo.fulfilled,
                (state, action: PayloadAction<ApiResponse<string>>) => {
                    if (action.payload?.isSuccess && state.profile) {
                        state.profile.logo = action.payload.data;
                    }
                }
            )
            .addCase(
                fetchGetOrganizerProfileDetailById.fulfilled,
                (state, action: PayloadAction<ApiResponse<OrganizerProfileDetail>>) => {
                    if (action.payload?.isSuccess) {
                        state.profileDetail = action.payload.data;
                    }
                }
            )
            .addCase(
                fetchPendingOrganizers.fulfilled,
                (state, action: PayloadAction<GetPendingOrganizersResponse>) => {
                    if (action.payload?.isSuccess && action.payload.data) {
                        state.pendingOrganizers = action.payload.data.items;
                        state.pagination = {
                            pageNumber: action.payload.data.pageNumber,
                            pageSize: action.payload.data.pageSize,
                            totalCount: action.payload.data.totalCount,
                            totalPages: action.payload.data.totalPages,
                            hasPrevious: action.payload.data.hasPrevious,
                            hasNext: action.payload.data.hasNext,
                        };
                    }
                }
            )
            .addCase(
                fetchGetOrganizerDetail.fulfilled,
                (state, action: PayloadAction<ApiResponse<OrganizerProfileDetail>>) => {
                    if (action.payload?.isSuccess) {
                        state.selectedOrganizerDetail = action.payload.data;
                    }
                }
            );
    },
});

export default organizerProfileSlice.reducer;