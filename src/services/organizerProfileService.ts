import type { AxiosResponse } from "axios";
import type {
    CreateProfileOrganizerRequest,
    GetOrganizerProfileResponse,
    OrganizerProfileDetail,
} from "../types/organizerProfile/organizerProfile";
import { interceptorAPI } from "../utils/attachInterceptors";
import type { ApiResponse } from "../types/api";

const organizerProfileService = {
    getProfile: (): Promise<AxiosResponse<GetOrganizerProfileResponse>> => {
        return interceptorAPI().get("/organizer/me");
    },
    updateOrganizerDraftLogo: (userId: string, file: File): Promise<AxiosResponse<ApiResponse<string>>> => {
        const formData = new FormData();
        formData.append("file", file);

        return interceptorAPI().patch(`/organizers/${userId}/logo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    getOrganizerProfileDetailById: (userId: string): Promise<AxiosResponse<ApiResponse<OrganizerProfileDetail>>> => {
        return interceptorAPI().get(`/organizers/detail/${userId}`);
    },
    createProfile: (data: CreateProfileOrganizerRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post("/organizer/profile/start-or-update", data)
    },
    verifyProfile: (): Promise<AxiosResponse<any>> => {
        return interceptorAPI().post(`/organizers/submit`)
    }
};

export default organizerProfileService;