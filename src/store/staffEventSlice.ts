import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import staffEventService from "../services/staffEventService"
import type { GetEventSpecApiResponse } from "../services/staffEventService"

const name = "staffEvent"

interface StaffEventState {
    eventSpec: {
        spec: string
        specImage: string
    } | null
    eventId: string | null
    loading: boolean
    error: string | null
}

const initialState: StaffEventState = {
    eventSpec: null,
    eventId: null,
    loading: false,
    error: null
}

export const fetchEventSpec = createAsyncThunk<
    GetEventSpecApiResponse,
    string
>(
    `${name}/fetchEventSpec`,
    async (eventId, thunkAPI) => {
        try {
            const response = await staffEventService.getEventSpec(eventId)
            return response.data
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error?.response?.data ?? error?.message)
        }
    }
)

const staffEventSlice = createSlice({
    name,
    initialState,
    reducers: {
        clearEventSpec: (state) => {
            state.eventSpec = null
            state.eventId = null
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEventSpec.pending, (state, action) => {
                state.loading = true
                state.error = null
                // Store the eventId being fetched
                state.eventId = action.meta.arg
            })
            .addCase(fetchEventSpec.fulfilled, (state, action: PayloadAction<GetEventSpecApiResponse>) => {
                state.loading = false
                if (action.payload.isSuccess) {
                    state.eventSpec = action.payload.data
                } else {
                    state.error = action.payload.message
                }
            })
            .addCase(fetchEventSpec.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as any)?.message ?? "Failed to fetch event spec"
            })
    }
})

export const { clearEventSpec } = staffEventSlice.actions
export default staffEventSlice.reducer
