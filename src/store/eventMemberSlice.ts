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
    fetchingMembers: boolean;
    addingMember: boolean;
}

const initialState: EventMemberState = {
    members: [],
    fetchingMembers: false,
    addingMember: false,
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
    { eventId: string; data: AddEventMemberRequest },
    { rejectValue: { status: number; message: string } }
>(
    `${name}/fetchAddEventMember`,
    async ({ eventId, data }, thunkAPI) => {
        try {
            const response = await eventMemberService.addMember(eventId, data);
            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue({
                status: error.response?.status,
                message: error.response?.data?.message,
            });
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
        builder
            .addCase(fetchEventMembers.pending, (state) => {
                state.fetchingMembers = true;
            })
            .addCase(fetchEventMembers.fulfilled, (state, action: PayloadAction<GetEventMembersResponse>) => {
                state.fetchingMembers = false;
                if (action.payload?.isSuccess) {
                    state.members = action.payload.data;
                }
            })
            .addCase(fetchEventMembers.rejected, (state) => {
                state.fetchingMembers = false;
            })

            .addCase(fetchAddEventMember.pending, (state) => {
                state.addingMember = true;
            })
            .addCase(fetchAddEventMember.fulfilled, (state, action) => {
                state.addingMember = false;
                if (action.payload?.isSuccess && action.payload.data) {
                    state.members.unshift(action.payload.data);
                }
            })
            .addCase(fetchAddEventMember.rejected, (state) => {
                state.addingMember = false;
            })

            .addCase(fetchUpdateEventMemberPermissions.fulfilled, (state, action) => {
                if (action.payload?.isSuccess) {
                    const { staffId, data } = action.meta.arg;
                    const index = state.members.findIndex((m) => m.id === staffId);
                    if (index !== -1) {
                        state.members[index] = {
                            ...state.members[index],
                            permissions: data.permissions,
                        };
                    }
                }
            })

            .addCase(fetchRemoveEventMember.fulfilled, (state, action) => {
                if (action.payload?.isSuccess) {
                    const removedId = action.meta.arg.staffId;
                    state.members = state.members.filter((m) => m.id !== removedId);
                }
            });
    },
});

export default eventMemberSlice.reducer;