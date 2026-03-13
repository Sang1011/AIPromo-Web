import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import eventMemberService from "../services/eventMemberService";
import type {
    AddEventMemberRequest,
    EventMember,
    GetEventMembersResponse,
    UpdateEventMemberPermissionsRequest
} from "../types/eventMember/eventMember";

const name = "eventMember";

interface EventMemberState {
    members: EventMember[];
}

const initialState: EventMemberState = {
    members: [],
};

export const fetchEventMembers = createAsyncThunk<GetEventMembersResponse, string>(
    `${name}/fetchEventMembers`,
    async (eventId, thunkAPI) => {
        try {
            const response = await eventMemberService.getMembers(eventId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchAddEventMember = createAsyncThunk<
    any,
    { eventId: string; data: AddEventMemberRequest }
>(
    `${name}/fetchAddEventMember`,
    async ({ eventId, data }, thunkAPI) => {
        try {
            const response = await eventMemberService.addMember(eventId, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateEventMemberPermissions = createAsyncThunk<
    any,
    { eventId: string; staffId: string; data: UpdateEventMemberPermissionsRequest }
>(
    `${name}/fetchUpdateEventMemberPermissions`,
    async ({ eventId, staffId, data }, thunkAPI) => {
        try {
            const response = await eventMemberService.updateMemberPermissions(eventId, staffId, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRemoveEventMember = createAsyncThunk<
    any,
    { eventId: string; staffId: string }
>(
    `${name}/fetchRemoveEventMember`,
    async ({ eventId, staffId }, thunkAPI) => {
        try {
            const response = await eventMemberService.removeMember(eventId, staffId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const eventMemberSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchEventMembers.fulfilled,
            (state, action: PayloadAction<GetEventMembersResponse>) => {
                if (action.payload?.isSuccess) {
                    state.members = action.payload.data;
                }
            }
        );
    },
});

export default eventMemberSlice.reducer;