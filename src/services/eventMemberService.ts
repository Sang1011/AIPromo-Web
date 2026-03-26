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
        return interceptorAPI().post(`/organizer/events/${eventId}/member`, data);
    },
    updateMemberPermissions: (
        eventId: string,
        staffId: string,
        data: UpdateEventMemberPermissionsRequest
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/organizer/events/${eventId}/member/${staffId}`, data);
    },
    removeMember: (eventId: string, staffId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/organizer/events/${eventId}/member/${staffId}`);
    },
};

export default eventMemberService;