import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import adminEventService from "../services/adminEventService";
import type {
    AdminEventItem,
    GetAllAdminEventsResponse,
} from "../types/adminEvent/adminEvent";

const name = "adminEvent";

interface AdminEventState {
    allEvents: AdminEventItem[]; // All events from API
    filteredEvents: AdminEventItem[]; // Filtered events
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
        hasPrevious: boolean;
        hasNext: boolean;
    } | null;
    filters: {
        Title?: string;
        Statuses?: string;
        OrganizerId?: string;
    };
    loading: boolean;
    error: string | null;
}

const initialState: AdminEventState = {
    allEvents: [],
    filteredEvents: [],
    pagination: null,
    filters: {
        Title: "",
        Statuses: "",
        OrganizerId: "",
    },
    loading: false,
    error: null,
};

export const fetchAllAdminEvents = createAsyncThunk<GetAllAdminEventsResponse, { PageNumber: number; PageSize: number }>(
    `${name}/fetchAllAdminEvents`,
    async (params, thunkAPI) => {
        try {
            return (await adminEventService.getAllEvents(params)).data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message);
        }
    }
);

const adminEventSlice = createSlice({
    name,
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<{ Title?: string; Statuses?: string; OrganizerId?: string }>) => {
            state.filters = { ...state.filters, ...action.payload };
            // Apply filters client-side
            state.filteredEvents = state.allEvents.filter((event) => {
                const matchTitle = !state.filters.Title || 
                    event.title.toLowerCase().includes(state.filters.Title.toLowerCase());
                const matchStatus = !state.filters.Statuses || 
                    event.status === state.filters.Statuses;
                const matchOrganizer = !state.filters.OrganizerId || 
                    event.organizerId === state.filters.OrganizerId;
                return matchTitle && matchStatus && matchOrganizer;
            });
            // Update pagination for filtered results
            const pageSize = 10;
            const totalCount = state.filteredEvents.length;
            const totalPages = Math.ceil(totalCount / pageSize);
            state.pagination = {
                pageNumber: 1,
                pageSize,
                totalCount,
                totalPages,
                hasPrevious: false,
                hasNext: totalPages > 1,
            };
        },
        resetFilters: (state) => {
            state.filters = {
                Title: "",
                Statuses: "",
                OrganizerId: "",
            };
            state.filteredEvents = state.allEvents;
        },
        setPageNumber: (state, action: PayloadAction<number>) => {
            if (state.pagination) {
                state.pagination.pageNumber = action.payload;
                state.pagination.hasPrevious = action.payload > 1;
                state.pagination.hasNext = action.payload < state.pagination.totalPages;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllAdminEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchAllAdminEvents.fulfilled,
                (state, action: PayloadAction<GetAllAdminEventsResponse>) => {
                    state.loading = false;
                    if (action.payload?.isSuccess && action.payload.data) {
                        state.allEvents = action.payload.data.items;
                        state.filteredEvents = action.payload.data.items;
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
            .addCase(fetchAllAdminEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? "Failed to fetch events";
            });
    },
});

export const { setFilters, resetFilters, setPageNumber } = adminEventSlice.actions;
export default adminEventSlice.reducer;
