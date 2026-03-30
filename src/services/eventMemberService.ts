import type { AxiosResponse } from "axios";
import type {
    AddEventMemberRequest,
    GetEventMembersResponse,
    UpdateEventMemberPermissionsRequest
} from "../types/eventMember/eventMember";
import { interceptorAPI } from "../utils/attachInterceptors";

const eventMemberService = {
    getMembers: (eventId: string): Promise<AxiosResponse<GetEventMembersResponse>> => {
        return interceptorAPI().get(`/organizer/events/${eventId}/member`);
    },
    addMember: (eventId: string, data: AddEventMemberRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/organizer/events/${eventId}/member`, data);
    },
    updateMemberPermissions: (
        eventId: string,
        memberId: string,
        data: UpdateEventMemberPermissionsRequest
    ): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch(`/organizer/events/${eventId}/member/${memberId}`, data);
    },
    removeMember: (eventId: string, memberId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().delete(`/organizer/events/${eventId}/member/${memberId}`);
    },
    exportExcelMember: (eventId: string): Promise<AxiosResponse<any>> => {
        return interceptorAPI().get(
            `/organizer/events/${eventId}/members/export`,
            {
                responseType: "blob",
            }
        );
    }
};

export default eventMemberService;