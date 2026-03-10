import type {
    CreateEventRequest,
    GetAllEventResponse,
    GetAllRequest,
    GetEventDetailResponse,
    UpdateEventInfoRequest,
    UpdateEventSettingsRequest,
    CreateEventSessionRequest
} from "../types/event/event"

import API from "./api"
import type { AxiosResponse } from "axios"

const eventService = {
    createEvent: (data: CreateEventRequest): Promise<AxiosResponse<any>> => {
        return API.call().post("/events", data);
    },

    updateEvent: (id: string, data: UpdateEventInfoRequest): Promise<AxiosResponse<any>> => {
        return API.call().put(`/events/${id}`, data);
    },

    deleteEvent: (id: string): Promise<AxiosResponse<any>> => {
        return API.call().delete(`/events/${id}`);
    },

    getEventById: (id: string): Promise<AxiosResponse<GetEventDetailResponse>> => {
        return API.call().get(`/events/${id}`);
    },

    getAllEvents: (request: GetAllRequest): Promise<AxiosResponse<GetAllEventResponse>> => {
        return API.call().get("/events", {
            params: request
        });
    },

    uploadBanner: (file: File): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append("file", file);

        return API.call().post("/events/upload-banner", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateBanner: (eventId: string, file: File): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append("file", file);

        return API.call().put(`/events/${eventId}/banner`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    uploadImage: (eventId: string, file: File): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append("file", file);

        return API.call().post(`/events/${eventId}/images`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateImage: (eventId: string, imageId: string, file: File): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append("file", file);

        return API.call().put(`/events/${eventId}/images/${imageId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteImage: (eventId: string, imageId: string): Promise<AxiosResponse<any>> => {
        return API.call().delete(`/events/${eventId}/images/${imageId}`);
    },

    updateEventSettings: (
        eventId: string,
        data: UpdateEventSettingsRequest
    ): Promise<AxiosResponse<any>> => {
        return API.call().patch(`/events/${eventId}/settings`, data);
    },

    createEventSessions: (
        eventId: string,
        data: CreateEventSessionRequest
    ): Promise<AxiosResponse<any>> => {
        return API.call().post(`/events/${eventId}/sessions`, data);
    },

    updateSeatmapSpec: (
        eventId: string,
        spec: string
    ): Promise<AxiosResponse<any>> => {
        return API.call().patch(`/events/${eventId}/spec`, spec, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    },

    requestCancelEvent: (eventId: string, reason: string): Promise<AxiosResponse<any>> => {
        return API.call().post(`/events/${eventId}/request-cancellation`, { reason });
    },

    publishEvent: (eventId: string): Promise<AxiosResponse<any>> => {
        return API.call().post(`/events/${eventId}/publish`);
    },

    unpublishEvent: (eventId: string): Promise<AxiosResponse<any>> => {
        return API.call().post(`/events/${eventId}/unpublish`);
    }
}

export default eventService