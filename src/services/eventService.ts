import type {
    CreateEventRequest,
    GetAllEventResponse,
    GetAllRequest,
    GetEventDetailResponse,
    UpdateEventInfoRequest,
    UpdateEventSettingsRequest,
    CreateEventSessionRequest,
    UpdateEventSessionRequest,
    GetAllSessionResponse,
    GetAllRequestByMe,
    GetAllEventByMeResponse,
    UpdateTicketTypeRequest,
    CreateTicketTypeRequest,
    GetPendingEventsResponse,
    GetPendingEventsRequest,
    UpdateSeatMapRequest
} from "../types/event/event"
import type { AxiosResponse } from "axios"
import { interceptorAPI } from "../utils/attachInterceptors";
import API from "./api";
import type { ApiResponse } from "../types/api";

const eventService = {
    createEvent: (data: CreateEventRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post("/events", data);
    },

    updateEvent: (id: string, data: UpdateEventInfoRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${id}`, data);
    },

    deleteEvent: (id: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/events/${id}`);
    },

    getEventById: (id: string): Promise<AxiosResponse<GetEventDetailResponse>> => {
        return API.call().get(`/events/${id}`);
    },

    getAllEvents: (request: GetAllRequest): Promise<AxiosResponse<GetAllEventResponse>> => {
        return API.call().get("/events", {
            params: request
        });
    },

    getAllEventsByMe: (request: GetAllRequestByMe): Promise<AxiosResponse<GetAllEventByMeResponse>> => {
        return interceptorAPI().get("/events/me", {
            params: request
        });
    },

    upload: (folder: string, file: File): Promise<AxiosResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append("folder", folder);
        formData.append("file", file);
        return interceptorAPI().post(`/events/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateEventBanner: (eventId: string, file: File): Promise<AxiosResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append("file", file);
        return interceptorAPI().patch(`/events/${eventId}/banner`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    createImage: (eventId: string, file: File): Promise<AxiosResponse<{ id: string; imageUrl: string }>> => {
        const formData = new FormData();
        formData.append("file", file);
        return interceptorAPI().post(`/events/${eventId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    updateImage: (eventId: string, imageId: string, file: File): Promise<AxiosResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append("file", file);
        return interceptorAPI().put(`/events/${eventId}/images/${imageId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteImage: (eventId: string, imageId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/events/${eventId}/images/${imageId}`);
    },

    updateEventSettings: (
        eventId: string,
        data: UpdateEventSettingsRequest
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().put(`/events/${eventId}/settings`, data);
    },

    createEventSessions: (
        eventId: string,
        data: CreateEventSessionRequest
    ): Promise<AxiosResponse<string[]>> => {
        return interceptorAPI().post(`/events/${eventId}/sessions`, data);
    },

    getSessions: (eventId: string): Promise<AxiosResponse<ApiResponse<GetAllSessionResponse>>> => {
        return interceptorAPI().get(`/events/${eventId}/sessions`);
    },

    deleteSession: (eventId: string, sessionId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/events/${eventId}/sessions/${sessionId}`);
    },

    updateSession: (
        eventId: string,
        sessionId: string,
        data: UpdateEventSessionRequest
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/sessions/${sessionId}`, data);
    },

    requestCancelEvent: (eventId: string, reason: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/request-cancellation`, { reason });
    },

    publishEvent: (eventId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/publish`);
    },

    rejectPublishEvent: (eventId: string, reason: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/reject-publish`, { reason }, {
            headers: { "Content-Type": "application/json" }
        });
    },

    cancelEvent: (eventId: string, reason: string): Promise<AxiosResponse<any>> => {
    return interceptorAPI().patch(`/events/${eventId}/cancel`, {reason});
    },

    unpublishEvent: (eventId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/unpublish`);
    },
    requestPublishEvent: (eventId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/request-publish`);
    },
    getPendingEvents: (request: GetPendingEventsRequest): Promise<AxiosResponse<GetPendingEventsResponse>> => {
        return interceptorAPI().get("/events/pending", {
        params: request
    });
    },
    getSeatMap: (eventId: string): Promise<AxiosResponse<ApiResponse<UpdateSeatMapRequest>>> => {
        return interceptorAPI().get(`/events/${eventId}/spec`);
    },
    updateSeatMap: (eventId: string, spec: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/spec`, spec, {
            headers: {
                "Content-Type": "application/json",
            },
        })
    },
    updateEventPolicy: (eventId: string, policy: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/policy`, { policy });
    },
    
}

export default eventService