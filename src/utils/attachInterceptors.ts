import type { AxiosInstance } from "axios";
import API from "../services/api";

function attachInterceptors(instance: AxiosInstance): AxiosInstance {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("ACCESS_TOKEN");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.error("Unauthorized");
            }

            return Promise.reject(error);
        }
    );

    return instance;
}

export function interceptorAPI(): AxiosInstance {
    const instance = API.call();
    return attachInterceptors(instance);
}