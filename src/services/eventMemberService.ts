import type { AxiosResponse } from "axios";
import type {
    AddEventMemberRequest,
    GetEventMembersResponse,
    UpdateEventMemberPermissionsRequest
} from "../types/eventMember/eventMember";
import { interceptorAPI } from "../utils/attachInterceptors";

const eventMemberService = {
    getMembers: (eventId: string): Promise<AxiosResponse<GetEventMembersResponse>> => {
        return interceptorAPI().get(`/events/${eventId}/staff`);
    },
    addMember: (eventId: string, data: AddEventMemberRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/events/${eventId}/staff`, data);
    },
    updateMemberPermissions: (
        eventId: string,
        staffId: string,
        data: UpdateEventMemberPermissionsRequest
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/events/${eventId}/staff/${staffId}`, data);
    },
    removeMember: (eventId: string, staffId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/events/${eventId}/staff/${staffId}`);
    },
};

export default eventMemberService;