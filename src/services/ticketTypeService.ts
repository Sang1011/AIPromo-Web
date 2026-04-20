import type { AxiosResponse } from "axios";
import { interceptorAPI } from "../utils/attachInterceptors";
import type {
    AssignAreaRequest,
    CreateTicketTypeRequest,
    CreateTicketTypeResponse,
    GetAllTicketTypesResponse,
    UpdateTicketTypeRequest,
} from "../types/ticketType/ticketType";

const ticketTypeService = {
    createTicketType: (
        eventId: string,
        data: CreateTicketTypeRequest
    ): Promise<AxiosResponse<CreateTicketTypeResponse>> => {
        return interceptorAPI().post(`/organizer/events/${eventId}/ticket-types`, data);
    },

    getAllTicketTypes: (
        eventId: string,
        eventSessionId: string
    ): Promise<AxiosResponse<GetAllTicketTypesResponse>> => {
        return interceptorAPI().get(`/events/${eventId}/ticket-types?eventSessionId=${eventSessionId}`);
    },

    updateTicketType: (
        eventId: string,
        ticketTypeId: string,
        data: UpdateTicketTypeRequest
    ): Promise<AxiosResponse<void>> => {
        return interceptorAPI().patch(`/organizer/events/${eventId}/ticket-types/${ticketTypeId}`, data);
    },

    deleteTicketType: (
        eventId: string,
        ticketTypeId: string
    ): Promise<AxiosResponse<void>> => {
        return interceptorAPI().delete(`/events/${eventId}/ticket-types/${ticketTypeId}`);
    },

    assignArea: (
        eventId: string,
        ticketTypeId: string,
        data: AssignAreaRequest
    ): Promise<AxiosResponse<void>> => {
        return interceptorAPI().patch(`/organizer/events/${eventId}/ticket-types/${ticketTypeId}/assign-area`, data);
    },
};

export default ticketTypeService;