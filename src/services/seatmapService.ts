import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { AssignAreasRequest, GetSeatMapResponse } from "../types/seatmap/seatmap";
import type { ApiResponse } from "../types/api";

const seatmapService = {
    getSeatMap: (eventId: string, sessionId: string): Promise<AxiosResponse<ApiResponse<GetSeatMapResponse>>> => {
        return interceptorAPI().get(`/events/${eventId}/sessions/${sessionId}/spec`);
    },
    updateSeatMap: (eventId: string, spec: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/organizer/events/${eventId}/spec`, spec, {
            headers: {
                "Content-Type": "application/json",
            },
        })
    },
    assignAreas: (eventId: string, data: AssignAreasRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/ticket-types/assign-area`, data,
            { headers: { 'Content-Type': 'application/json' } }
        );
    },
};

export default seatmapService;