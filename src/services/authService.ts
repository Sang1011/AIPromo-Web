import type { LoginRequest, RegisterRequest, UserProfile, UserProfileRequest } from "../types/auth/auth"
import { interceptorAPI } from "../utils/attachInterceptors"
import API from "./api"
import type { AxiosResponse } from "axios"

const authService = {
  login: (data: LoginRequest): Promise<AxiosResponse<any>> => {
    return API.call().post("/auth/login", data)
  },
  loginGoogle: (data = {}) => {
    return API.call().post("/auth/google-login", data)
  },
  register: (data: RegisterRequest): Promise<AxiosResponse<any>> => {
    return API.call().post("/auth/register", data)
  },
  fetchWithMe: (token: string): Promise<AxiosResponse<any>> => {
    return API.callWithToken(token).get("/user/current")
  },
  refreshToken: (data: any): Promise<AxiosResponse<any>> => {
    return API.callWithToken().post("/auth/refresh-token", data)
  },
  forgotPassword: (email: string): Promise<AxiosResponse<any>> =>
    API.call().post("/auth/forgot-password", { email }),

  resetPassword: (email: string, otpCode: string, newPassword: string): Promise<AxiosResponse<any>> =>
    API.call().post("/auth/reset-password", { email, otpCode, newPassword }),

  userDetail: (id: string): Promise<AxiosResponse<UserProfile>> =>
    interceptorAPI().get(`/user/${id}`),

  updateUser: (data: UserProfileRequest ): Promise<AxiosResponse<any>> => {
    return interceptorAPI().patch(`users/profile`, data);
  },
}

export default authService