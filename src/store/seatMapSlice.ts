import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import eventService from "../services/eventService";
import seatmapService from "../services/seatmapService";
import type { AssignAreasRequest } from "../types/seatmap/seatmap";

interface SeatMapState {
    spec: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: SeatMapState = {
    spec: null,
    loading: false,
    error: null,
};

export const fetchGetSeatMap = createAsyncThunk(
    "SEAT_MAP/getSpec",
    async ({ eventId, sessionId }: { eventId: string; sessionId: string }, { rejectWithValue }) => {
        try {
            const res = await seatmapService.getSeatMap(eventId, sessionId);
            return res.data.data.spec;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể tải seatmap");
        }
    }
);

export const fetchUpdateSeatMap = createAsyncThunk(
    "SEAT_MAP/updateSpec",
    async ({ eventId, spec }: { eventId: string; spec: string }, { rejectWithValue }) => {
        try {
            await seatmapService.updateSeatMap(eventId, spec);
            return spec;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể cập nhật seatmap");
        }
    }
);



export const fetchAssignAreas = createAsyncThunk(
    "SEAT_MAP/assignAreas",
    async ({ eventId, data }: { eventId: string; data: AssignAreasRequest }, { rejectWithValue }) => {
        try {
            await seatmapService.assignAreas(eventId, data);
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? "Không thể gán khu vực");
        }
    }
);

const seatMapSlice = createSlice({
    name: "SEAT_MAP",
    initialState,
    reducers: {
        clearSeatMap(state) {
            state.spec = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetSeatMap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetSeatMap.fulfilled, (state, action) => {
                state.loading = false;
                state.spec = action.payload;
            })
            .addCase(fetchGetSeatMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(fetchUpdateSeatMap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUpdateSeatMap.fulfilled, (state, action) => {
                state.loading = false;
                state.spec = action.payload;
            })
            .addCase(fetchUpdateSeatMap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSeatMap } = seatMapSlice.actions;
export default seatMapSlice.reducer;