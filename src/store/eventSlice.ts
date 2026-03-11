import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import eventService from "../services/eventService";
import type {
    EventItem,
    GetAllEventResponse,
    GetEventDetailResponse,
    CreateEventRequest,
    UpdateEventInfoRequest,
    UpdateEventSettingsRequest,
    CreateEventSessionRequest,
    GetAllRequest
} from "../types/event/event";

const name = "event";

interface EventState {
    events: EventItem[];
    currentEvent: GetEventDetailResponse | null;
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
         hasPrevious: boolean;  
         hasNext: boolean;
    } | null;
}

const initialState: EventState = {
    events: [],
    currentEvent: null,
    pagination: null
};

export const fetchAllEvents = createAsyncThunk<
    GetAllEventResponse,
    GetAllRequest
>(
    `${name}/fetchAllEvents`,
    async (params, thunkAPI) => {
        try {
            const response = await eventService.getAllEvents(params);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchEventById = createAsyncThunk<
    GetEventDetailResponse,
    string
>(
    `${name}/fetchEventById`,
    async (id, thunkAPI) => {
        try {
            const response = await eventService.getEventById(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateEvent = createAsyncThunk<
    any,
    CreateEventRequest
>(
    `${name}/fetchCreateEvent`,
    async (data, thunkAPI) => {
        try {
            const response = await eventService.createEvent(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateEvent = createAsyncThunk<
    any,
    { id: string; data: UpdateEventInfoRequest }
>(
    `${name}/fetchUpdateEvent`,
    async ({ id, data }, thunkAPI) => {
        try {
            const response = await eventService.updateEvent(id, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteEvent = createAsyncThunk<
    any,
    string
>(
    `${name}/fetchDeleteEvent`,
    async (id, thunkAPI) => {
        try {
            const response = await eventService.deleteEvent(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateEventSettings = createAsyncThunk<
    any,
    { eventId: string; data: UpdateEventSettingsRequest }
>(
    `${name}/fetchUpdateEventSettings`,
    async ({ eventId, data }, thunkAPI) => {
        try {
            const response = await eventService.updateEventSettings(eventId, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateEventSessions = createAsyncThunk<
    any,
    { eventId: string; data: CreateEventSessionRequest }
>(
    `${name}/fetchCreateEventSessions`,
    async ({ eventId, data }, thunkAPI) => {
        try {
            const response = await eventService.createEventSessions(eventId, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const eventSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchAllEvents.fulfilled,
            (state, action: PayloadAction<GetAllEventResponse>) => {
                state.events = action.payload.data.items;
                state.pagination = {
                    pageNumber: action.payload.data.pageNumber,
                    pageSize: action.payload.data.pageSize,
                    totalCount: action.payload.data.totalCount,
                    totalPages: action.payload.data.totalPages,
                    hasPrevious: action.payload.data.hasPrevious,  
                    hasNext:     action.payload.data.hasNext, 
                };
            }
        );

        builder.addCase(
            fetchEventById.fulfilled,
            (state, action: PayloadAction<GetEventDetailResponse>) => {
                state.currentEvent = action.payload;
            }
        );

        builder.addCase(fetchDeleteEvent.fulfilled, (state, action) => {
            const deletedId = action.meta.arg;
            state.events = state.events.filter(e => e.id !== deletedId);
        });
    }
});

export default eventSlice.reducer;