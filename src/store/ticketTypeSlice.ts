import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import ticketTypeService from "../services/ticketTypeService";
import type {
    AssignAreaRequest,
    CreateTicketTypeRequest,
    TicketTypeItem,
    UpdateTicketTypeRequest,
} from "../types/ticketType/ticketType";

const name = "ticketType";

interface TicketTypeState {
    ticketTypes: TicketTypeItem[];
}

const initialState: TicketTypeState = {
    ticketTypes: [],
};

export const fetchCreateTicketType = createAsyncThunk<
    string,
    { eventId: string; data: CreateTicketTypeRequest }
>(
    `${name}/fetchCreateTicketType`,
    async ({ eventId, data }, thunkAPI) => {
        try {
            return (await ticketTypeService.createTicketType(eventId, data)).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchGetAllTicketTypes = createAsyncThunk<
    TicketTypeItem[],
    { eventId: string, eventSessionId: string }
>(
    `${name}/fetchGetAllTicketTypes`,
    async ({ eventId, eventSessionId }, thunkAPI) => {
        try {
            const res = await ticketTypeService.getAllTicketTypes(eventId, eventSessionId);
            return res.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchUpdateTicketType = createAsyncThunk<
    void,
    { eventId: string; ticketTypeId: string; data: UpdateTicketTypeRequest }
>(
    `${name}/fetchUpdateTicketType`,
    async ({ eventId, ticketTypeId, data }, thunkAPI) => {
        try {
            await ticketTypeService.updateTicketType(eventId, ticketTypeId, data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchDeleteTicketType = createAsyncThunk<
    string,
    { eventId: string; ticketTypeId: string }
>(
    `${name}/fetchDeleteTicketType`,
    async ({ eventId, ticketTypeId }, thunkAPI) => {
        try {
            await ticketTypeService.deleteTicketType(eventId, ticketTypeId);
            return ticketTypeId;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

export const fetchAssignArea = createAsyncThunk<
    void,
    { eventId: string; ticketTypeId: string; data: AssignAreaRequest }
>(
    `${name}/fetchAssignArea`,
    async ({ eventId, ticketTypeId, data }, thunkAPI) => {
        try {
            await ticketTypeService.assignArea(eventId, ticketTypeId, data);
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

const ticketTypeSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchGetAllTicketTypes.fulfilled,
            (state, action: PayloadAction<TicketTypeItem[]>) => {
                state.ticketTypes = action.payload;
            }
        );

        builder.addCase(fetchDeleteTicketType.fulfilled, (state, action: PayloadAction<string>) => {
            state.ticketTypes = state.ticketTypes.filter((t) => t.id !== action.payload);
        });

        builder.addCase(fetchUpdateTicketType.fulfilled, (state, action) => {
            const { ticketTypeId, data } = action.meta.arg;
            const idx = state.ticketTypes.findIndex((t) => t.id === ticketTypeId);
            if (idx !== -1) {
                state.ticketTypes[idx] = { ...state.ticketTypes[idx], ...data };
            }
        });
    },
});

export default ticketTypeSlice.reducer;