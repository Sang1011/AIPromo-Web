import axios from "axios";
import type { AxiosInstance } from "axios";

const API = {
  call: function (): AxiosInstance {
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
  },
};

export default API;