import type { LoginRequest, RegisterRequest } from "../types/auth/auth"
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
  }
}

export default authService