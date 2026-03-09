import type { LoginRequest } from "../types/auth/auth"
import API from "./api"
import type { AxiosResponse } from "axios"

const authService = {
  login: (data: LoginRequest): Promise<AxiosResponse<any>> => {
    return API.call().post("/auth/login", data)
  },
  loginGoogle: (data = {}) => {
    return API.call().post("/auth/google-login", data)
  }
}

export default authService