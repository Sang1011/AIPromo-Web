import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import eventMemberService from "../services/eventMemberService";
import type {
    AddEventMemberRequest,
    EventItemByEventMember,
    EventMember,
    GetEventListByMemberAssignedResponse,
    GetEventMembersResponse,
    UpdateEventMemberPermissionsRequest
} from "../types/eventMember/eventMember";

const name = "eventMember";

interface EventMemberState {
    members: EventMember[];
    fetchingMembers: boolean;
    addingMember: boolean;
    assignedEvents: EventItemByEventMember[];
    fetchingAssignedEvents: boolean;
}

const initialState: EventMemberState = {
    members: [],
    fetchingMembers: false,
    addingMember: false,
    assignedEvents: [],
    fetchingAssignedEvents: false,
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
    { eventId: string; memberId: string; data: UpdateEventMemberPermissionsRequest }
>(
    `${name}/fetchUpdateEventMemberPermissions`,
    async ({ eventId, memberId, data }, thunkAPI) => {
        try {
            const response = await eventMemberService.updateMemberPermissions(eventId, memberId, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRemoveEventMember = createAsyncThunk<
    any,
    { eventId: string; memberId: string }
>(
    `${name}/fetchRemoveEventMember`,
    async ({ eventId, memberId }, thunkAPI) => {
        try {
            const response = await eventMemberService.removeMember(eventId, memberId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchExportExcelMember = createAsyncThunk<Blob, string>(
    `${name}/fetchExportExcelMember`,
    async (eventId, { rejectWithValue }) => {
        try {
            const res = await eventMemberService.exportExcelMember(eventId);
            return res.data;
        } catch (err) {
            return rejectWithValue("Không thể export member");
        }
    }
);

export const fetchEventListAssignedForCurrentUser = createAsyncThunk<
    GetEventListByMemberAssignedResponse,
    void,
    { rejectValue: string }
>(
    `${name}/fetchEventListAssignedForCurrentUser`,
    async (_, { rejectWithValue }) => {
        try {
            const response = await eventMemberService.getEventListByMemberAssigned();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.message ?? "Không thể lấy danh sách sự kiện được phân công"
            );
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
                    const { memberId: staffId, data } = action.meta.arg;
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
                    const removedId = action.meta.arg.memberId;
                    state.members = state.members.filter((m) => m.id !== removedId);
                }
            })

            .addCase(fetchEventListAssignedForCurrentUser.pending, (state) => {
                state.fetchingAssignedEvents = true;
            })
            .addCase(fetchEventListAssignedForCurrentUser.fulfilled, (state, action) => {
                state.fetchingAssignedEvents = false;
                if (action.payload?.isSuccess) {
                    state.assignedEvents = action.payload.data;
                }
            })
            .addCase(fetchEventListAssignedForCurrentUser.rejected, (state) => {
                state.fetchingAssignedEvents = false;
            });
    },
});

export default eventMemberSlice.reducer;