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
    GetPendingEventsRequest,
    PendingEventsData,
    EventItemByMe,
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
    myEvents: EventItemByMe[];
    myEventsPagination: {
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
    pagination: null,
    myEvents: [],
    myEventsPagination: null,
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

export const fetchUpdateEventPolicy = createAsyncThunk<any, { eventId: string; policy: string }>(
    `${name}/fetchUpdateEventPolicy`,
    async ({ eventId, policy }, thunkAPI) => {
        try {
            return (await eventService.updateEventPolicy(eventId, policy)).data;
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

export const fetchPendingEvents = createAsyncThunk<
    PendingEventsData,
    GetPendingEventsRequest
>(
    `${name}/fetchPendingEvents`,
    async (params, thunkAPI) => {
        try {
            const res = await eventService.getPendingEvents(params);
            return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchPublishEvent = createAsyncThunk<any, string>(
    `${name}/publishEvent`,
    async (eventId, thunkAPI) => {
        try {
            const getRes = await eventService.getEventById(eventId);
            const eventObj = ((getRes.data as any)?.data) ?? (getRes.data as any) ?? null;
            const id = (eventObj && (eventObj.id ?? eventObj.eventId)) ?? eventId;
            const sessions = (eventObj as any)?.sessions ?? [];
            if (!sessions || sessions.length === 0) {
                return thunkAPI.rejectWithValue({ message: "Cannot publish event. At least one session is required." });
            }

            await eventService.publishEvent(id);

            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)

export const fetchCancelEvent = createAsyncThunk<any, { eventId: string; reason: string }>(
    `${name}/cancelEvent`,
    async ({ eventId, reason }, thunkAPI) => {
        try {
            const getRes = await eventService.getEventById(eventId);
            const eventObj = ((getRes.data as any)?.data) ?? (getRes.data as any) ?? null;
            const id = (eventObj && (eventObj.id ?? eventObj.eventId)) ?? eventId;

            await eventService.cancelEvent(id, reason);

            return { id, reason };
        } catch (error) {
            return thunkAPI.rejectWithValue(error)
        }
    }
)

export const fetchRejectPublishEvent = createAsyncThunk<any, { eventId: string; reason: string }>(
    `${name}/rejectPublishEvent`,
    async ({ eventId, reason }, thunkAPI) => {
        try {
            const getRes = await eventService.getEventById(eventId);
            const eventObj = ((getRes.data as any)?.data) ?? (getRes.data as any) ?? null;
            const id = (eventObj && (eventObj.id ?? eventObj.eventId)) ?? eventId;

            await eventService.rejectPublishEvent(id, reason);

            return { id, reason };
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
)

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

        builder.addCase(
            fetchAllEventsByMe.fulfilled,
            (state, action: PayloadAction<GetAllCreateResponseForPrivate>) => {
                state.myEvents = action.payload.items;

                state.myEventsPagination = {
                    pageNumber: action.payload.pageNumber,
                    pageSize: action.payload.pageSize,
                    totalCount: action.payload.totalCount,
                    totalPages: action.payload.totalPages,
                    hasPrevious: action.payload.hasPrevious,
                    hasNext: action.payload.hasNext,
                };
            }
        );

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
        builder.addCase(fetchPublishEvent.fulfilled, (state, action: PayloadAction<string>) => {
            const id = action.payload;

            state.events = state.events.map((e: any) => (e.id === id ? { ...e, status: "Published" } : e));

            if (state.currentEvent && ((state.currentEvent as any).id === id || (state.currentEvent as any).eventId === id)) {
                (state.currentEvent as any).status = "Published";
            }
        });

        builder.addCase(fetchRejectPublishEvent.fulfilled, (state, action: PayloadAction<{ id: string; reason: string }>) => {
            const { id } = action.payload;

            // mark event status back to Draft after rejection
            state.events = state.events.map((e: any) => (e.id === id ? { ...e, status: "Draft" } : e));

            if (state.currentEvent && ((state.currentEvent as any).id === id || (state.currentEvent as any).eventId === id)) {
                (state.currentEvent as any).status = "Draft";
            }
        });

        builder.addCase(fetchCancelEvent.fulfilled, (state, action: PayloadAction<{ id: string; reason: string }>) => {
            const { id } = action.payload;

            state.events = state.events.map((e: any) => (e.id === id ? { ...e, status: "Cancelled" } : e));

            if (state.currentEvent && ((state.currentEvent as any).id === id || (state.currentEvent as any).eventId === id)) {
                (state.currentEvent as any).status = "Cancelled";
            }
        });
        builder.addCase(fetchPendingEvents.fulfilled, (state, action) => {

            if (!action.payload) return

            state.events = action.payload.items

            state.pagination = {
                pageNumber: action.payload.pageNumber,
                pageSize: action.payload.pageSize,
                totalCount: action.payload.totalCount,
                totalPages: action.payload.totalPages,
                hasPrevious: action.payload.hasPrevious,
                hasNext: action.payload.hasNext
            }

        });
    },
});

export default eventSlice.reducer;