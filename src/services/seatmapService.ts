import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { AssignAreasRequest } from "../types/seatmap/seatmap";

const seatmapService = {
    getSeatMap: (eventId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(`/events/${eventId}/seat-map`);
    },

    updateSeatMap: (eventId: string, spec: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/seat-map`, { spec });
    },

    assignAreas: (eventId: string, data: AssignAreasRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/ticket-types/assign-area`, data,
            { headers: { 'Content-Type': 'application/json' } }
        );
    },
};

export default seatmapService;