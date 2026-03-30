import type { AxiosResponse } from "axios"
import { interceptorAPI } from "../utils/attachInterceptors"

export interface GetEventSpecResponse {
    spec: string
    specImage: string
}

export interface GetEventSpecApiResponse {
    isSuccess: boolean
    data: GetEventSpecResponse
    message: string
    timestamp: string
}

const staffEventService = {
    getEventSpec: (eventId: string): Promise<AxiosResponse<GetEventSpecApiResponse>> => {
        return interceptorAPI().get(`/staff/events/${eventId}/spec`)
    }
}

export default staffEventService
