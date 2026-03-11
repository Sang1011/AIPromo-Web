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
    GetAllRequest,
    UpdateEventSessionRequest,
    GetAllSessionResponse,
    GetAllEventByMeResponse,
    GetAllRequestByMe
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
    } | null;
}

const initialState: EventState = {
    events: [],
    currentEvent: null,
    pagination: null
};

export const fetchAllEvents = createAsyncThunk<GetAllEventResponse, GetAllRequest>(
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

export const fetchAllEventsByMe = createAsyncThunk<GetAllEventByMeResponse, GetAllRequestByMe>(
    `${name}/fetchAllEventsByMe`,
    async (params, thunkAPI) => {
        try {
            const response = await eventService.getAllEventsByMe(params);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchEventById = createAsyncThunk<GetEventDetailResponse, string>(
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

export const fetchCreateEvent = createAsyncThunk<any, CreateEventRequest>(
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

export const fetchUpdateEvent = createAsyncThunk<any, { id: string; data: UpdateEventInfoRequest }>(
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

export const fetchSessions = createAsyncThunk<GetAllSessionResponse, string>(
    `${name}/fetchSessions`,
    async (eventId, thunkAPI) => {
        try {
            const res = await eventService.getSessions(eventId);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const fetchDeleteSession = createAsyncThunk<any, { eventId: string; sessionId: string }>(
    `${name}/deleteSession`,
    async ({ eventId, sessionId }, thunkAPI) => {
        try {
            const res = await eventService.deleteSession(eventId, sessionId);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const fetchUpdateSession = createAsyncThunk<
    any,
    { eventId: string; sessionId: string; data: UpdateEventSessionRequest }
>(
    `${name}/updateSession`,
    async ({ eventId, sessionId, data }, thunkAPI) => {
        try {
            const res = await eventService.updateSession(eventId, sessionId, data);
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const fetchDeleteEvent = createAsyncThunk<any, string>(
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
    string[],
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

export const fetchUpload = createAsyncThunk<string, { folder: string; file: File }>(
    `${name}/fetchUpload`,
    async ({ folder, file }, thunkAPI) => {
        try {
            const response = await eventService.upload(folder, file);
            return response.data.url;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// ─── New thunks ───────────────────────────────────────────────────────────────

export const fetchUpdateEventBanner = createAsyncThunk<
    { url: string },
    { eventId: string; file: File }
>(
    `${name}/fetchUpdateEventBanner`,
    async ({ eventId, file }, thunkAPI) => {
        try {
            const response = await eventService.updateEventBanner(eventId, file);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateImage = createAsyncThunk<
    { url: string },
    { eventId: string; imageId: string; file: File }
>(
    `${name}/fetchUpdateImage`,
    async ({ eventId, imageId, file }, thunkAPI) => {
        try {
            const response = await eventService.updateImage(eventId, imageId, file);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteImage = createAsyncThunk<
    void,
    { eventId: string; imageId: string }
>(
    `${name}/fetchDeleteImage`,
    async ({ eventId, imageId }, thunkAPI) => {
        try {
            await eventService.deleteImage(eventId, imageId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRequestCancelEvent = createAsyncThunk<
    any,
    { eventId: string; reason: string }
>(
    `${name}/fetchRequestCancelEvent`,
    async ({ eventId, reason }, thunkAPI) => {
        try {
            const response = await eventService.requestCancelEvent(eventId, reason);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRequestPublishEvent = createAsyncThunk<any, string>(
    `${name}/fetchRequestPublishEvent`,
    async (eventId, thunkAPI) => {
        try {
            const response = await eventService.requestPublishEvent(eventId);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

// ─────────────────────────────────────────────────────────────────────────────

const eventSlice = createSlice({
    name,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            fetchAllEvents.fulfilled,
            (state, action: PayloadAction<GetAllEventResponse>) => {
                state.events = action.payload.items;
                state.pagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages
                };
            }
        );

        builder.addCase(
            fetchAllEventsByMe.fulfilled,
            (state, action: PayloadAction<GetAllEventByMeResponse>) => {
                state.events = action.payload.items;
                state.pagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages
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

        builder.addCase(fetchCreateEvent.fulfilled, (state, action) => {
            state.currentEvent = action.payload;
        });

        builder.addCase(fetchUpdateEvent.fulfilled, (state, action) => {
            state.currentEvent = action.payload;
        });

        builder.addCase(fetchUpdateEventSettings.fulfilled, (state, action) => {
            state.currentEvent = action.payload;
        });
    }
});

export default eventSlice.reducer;