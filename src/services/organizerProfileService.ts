import type { AxiosResponse } from "axios";
import type {
    CreateProfileOrganizerRequest,
    GetOrganizerProfileResponse,
    UpdateOrganizerBankRequest,
    UpdateOrganizerProfileRequest
} from "../types/organizerProfile/organizerProfile";
import { interceptorAPI } from "../utils/attachInterceptors";

const organizerProfileService = {
    getProfile: (): Promise<AxiosResponse<GetOrganizerProfileResponse>> => {
        return interceptorAPI().get("/organizers/profile");
    },
    updateProfile: (data: UpdateOrganizerProfileRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch("/organizers/profile", data);
    },
    updateBank: (data: UpdateOrganizerBankRequest): Promise<AxiosResponse<any>> => {
        return interceptorAPI().patch("/organizers/bank", data);
    },
    createProfile:(data: CreateProfileOrganizerRequest): Promise<AxiosResponse<any>>=>{
        return interceptorAPI().post("organizers/profile/full",data)
    },
    verifyProfile :(): Promise<AxiosResponse<any>>=>{
        return interceptorAPI().post(`/organizers/submit`)
    }
};

export default organizerProfileService;