import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import organizerProfileService from "../services/organizerProfileService";
import type {
    GetOrganizerProfileResponse,
    OrganizerProfile,
    UpdateOrganizerBankRequest,
    UpdateOrganizerProfileRequest
} from "../types/organizerProfile/organizerProfile";

const name = "organizerProfile";

interface OrganizerProfileState {
    profile: OrganizerProfile | null;
}

const initialState: OrganizerProfileState = {
    profile: null,
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

export const fetchUpdateOrganizerProfile = createAsyncThunk<any, UpdateOrganizerProfileRequest>(
    `${name}/fetchUpdateOrganizerProfile`,
    async (data, thunkAPI) => {
        try {
            const response = await organizerProfileService.updateProfile(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateOrganizerBank = createAsyncThunk<any, UpdateOrganizerBankRequest>(
    `${name}/fetchUpdateOrganizerBank`,
    async (data, thunkAPI) => {
        try {
            const response = await organizerProfileService.updateBank(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
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
        );
    },
});

export default organizerProfileSlice.reducer;