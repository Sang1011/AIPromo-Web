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
    GetAllRequestByMe,
    GetAllCreateResponseForPrivate,
    EventSession,
    CreateTicketTypeRequest,
    UpdateTicketTypeRequest,
} from "../types/event/event";
import type { ApiResponse } from "../types/api";

const name = "event";

interface EventState {
    events: EventItem[];
    currentEvent: GetEventDetailResponse | null;
    sessions: EventSession[];
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
    sessions: [],
    pagination: null
};


export const fetchAllEvents = createAsyncThunk<GetAllEventResponse, GetAllRequest>(
    `${name}/fetchAllEvents`,
    async (params, thunkAPI) => {
        try {
            return (await eventService.getAllEvents(params)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchAllEventsByMe = createAsyncThunk<GetAllCreateResponseForPrivate, GetAllRequestByMe>(
    `${name}/fetchAllEventsByMe`,
    async (params, thunkAPI) => {
        try {
            return (await eventService.getAllEventsByMe(params)).data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateImage = createAsyncThunk<
    { id: string; imageUrl: string },
    { eventId: string; file: File }
>(
    `${name}/fetchCreateImage`,
    async ({ eventId, file }, thunkAPI) => {
        try {
            return (await eventService.createImage(eventId, file)).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);


export const fetchEventById = createAsyncThunk<
    any,
    string
>(
    `${name}/fetchEventById`,
    async (id, thunkAPI) => {
        try {
            return (await eventService.getEventById(id)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchCreateEvent = createAsyncThunk<any, CreateEventRequest>(
    `${name}/fetchCreateEvent`,
    async (data, thunkAPI) => {
        try {
            return (await eventService.createEvent(data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateEvent = createAsyncThunk<any, { id: string; data: UpdateEventInfoRequest }>(
    `${name}/fetchUpdateEvent`,
    async ({ id, data }, thunkAPI) => {
        try {
            return (await eventService.updateEvent(id, data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteEvent = createAsyncThunk<any, string>(
    `${name}/fetchDeleteEvent`,
    async (id, thunkAPI) => {
        try {
            return (await eventService.deleteEvent(id)).data;
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
            return (await eventService.updateEventSettings(eventId, data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpload = createAsyncThunk<string, { folder: string; file: File }>(
    `${name}/fetchUpload`,
    async ({ folder, file }, thunkAPI) => {
        try {
            return (await eventService.upload(folder, file)).data.url;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateEventBanner = createAsyncThunk<{ url: string }, { eventId: string; file: File }>(
    `${name}/fetchUpdateEventBanner`,
    async ({ eventId, file }, thunkAPI) => {
        try {
            return (await eventService.updateEventBanner(eventId, file)).data;
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
            return (await eventService.updateImage(eventId, imageId, file)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteImage = createAsyncThunk<void, { eventId: string; imageId: string }>(
    `${name}/fetchDeleteImage`,
    async ({ eventId, imageId }, thunkAPI) => {
        try {
            await eventService.deleteImage(eventId, imageId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRequestCancelEvent = createAsyncThunk<any, { eventId: string; reason: string }>(
    `${name}/fetchRequestCancelEvent`,
    async ({ eventId, reason }, thunkAPI) => {
        try {
            return (await eventService.requestCancelEvent(eventId, reason)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchRequestPublishEvent = createAsyncThunk<any, string>(
    `${name}/fetchRequestPublishEvent`,
    async (eventId, thunkAPI) => {
        try {
            return (await eventService.requestPublishEvent(eventId)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);


export const fetchSessions = createAsyncThunk<ApiResponse<GetAllSessionResponse>, string>(
    `${name}/fetchSessions`,
    async (eventId, thunkAPI) => {
        try {
            const res = await eventService.getSessions(eventId);
            console.log(res.data)
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
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
            return (await eventService.createEventSessions(eventId, data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
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
            return (await eventService.updateSession(eventId, sessionId, data)).data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const fetchDeleteSession = createAsyncThunk<any, { eventId: string; sessionId: string }>(
    `${name}/deleteSession`,
    async ({ eventId, sessionId }, thunkAPI) => {
        try {
            return (await eventService.deleteSession(eventId, sessionId)).data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

export const fetchCreateTicketType = createAsyncThunk<
    any,
    { eventId: string; sessionId: string; data: CreateTicketTypeRequest }
>(
    `${name}/fetchCreateTicketType`,
    async ({ eventId, sessionId, data }, thunkAPI) => {
        try {
            return (await eventService.createTicketType(eventId, sessionId, data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUpdateTicketType = createAsyncThunk<
    any,
    { eventId: string; sessionId: string; ticketTypeId: string; data: UpdateTicketTypeRequest }
>(
    `${name}/fetchUpdateTicketType`,
    async ({ eventId, sessionId, ticketTypeId, data }, thunkAPI) => {
        try {
            return (await eventService.updateTicketType(eventId, sessionId, ticketTypeId, data)).data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchDeleteTicketType = createAsyncThunk<
    void,
    { eventId: string; sessionId: string; ticketTypeId: string }
>(
    `${name}/fetchDeleteTicketType`,
    async ({ eventId, sessionId, ticketTypeId }, thunkAPI) => {
        try {
            await eventService.deleteTicketType(eventId, sessionId, ticketTypeId);
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
        builder.addCase(fetchAllEvents.fulfilled, (state, action: PayloadAction<GetAllEventResponse>) => {
            state.events = action.payload.data.items;
            state.pagination = {
                pageNumber: action.payload.data.pageNumber,
                pageSize: action.payload.data.pageSize,
                totalCount: action.payload.data.totalCount,
                totalPages: action.payload.data.totalPages,
                hasPrevious: action.payload.data.hasPrevious,
                hasNext: action.payload.data.hasNext,
            };
        });

        builder.addCase(fetchAllEventsByMe.fulfilled, (state, action: PayloadAction<GetAllCreateResponseForPrivate>) => {
            state.events = action.payload.items;
            state.pagination = {
                pageNumber: action.payload.pageNumber,
                pageSize: action.payload.pageSize,
                totalCount: action.payload.totalCount,
                totalPages: action.payload.totalPages,
                hasPrevious: action.payload.hasPrevious,
                hasNext: action.payload.hasNext,
            };
        });

         builder.addCase(
            fetchEventById.fulfilled,
            (state, action) => {
                if (action.payload.isSuccess)
                    state.currentEvent = action.payload.data;
            }
        );

        builder.addCase(fetchDeleteEvent.fulfilled, (state, action) => {
            state.events = state.events.filter(e => e.id !== action.meta.arg);
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

        builder.addCase(fetchSessions.fulfilled, (state, action: PayloadAction<ApiResponse<GetAllSessionResponse>>) => {
            state.sessions = action.payload.data;
        });

        builder.addCase(fetchDeleteSession.fulfilled, (state, action) => {
            const { sessionId } = action.meta.arg;
            state.sessions = state.sessions.filter((s: any) => s.id !== sessionId);
        });
    },
});

export default eventSlice.reducer;