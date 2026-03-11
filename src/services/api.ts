import axios from "axios";
import type { AxiosInstance } from "axios";

const API = {
  call: function (): AxiosInstance {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
  },
  callWithToken: function (token : string): AxiosInstance {
    const accessToken = token ?? localStorage.getItem("ACCESS_TOKEN") ?? "";
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export default API;