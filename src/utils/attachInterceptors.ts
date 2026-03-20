import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import API from "../services/api";
import authService from "../services/authService";

let axiosInstance: AxiosInstance | null = null;

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let isLoggingOut = false;

let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
    pendingQueue.forEach((p) => {
        if (error) {
            p.reject(error);
        } else {
            p.resolve(token!);
        }
    });
    pendingQueue = [];
};

function attachInterceptors(instance: AxiosInstance): AxiosInstance {

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            return response;
        },

        async (error: AxiosError) => {
            const originalRequest = error.config as RetryAxiosRequestConfig;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        pendingQueue.push({
                            resolve,
                            reject
                        });
                    }).then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.set("Authorization", `Bearer ${token}`);
                        }
                        return instance(originalRequest);
                    });
                }
                isRefreshing = true;
                try {
                    const accessToken = localStorage.getItem("ACCESS_TOKEN");
                    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
                    const deviceId = localStorage.getItem("DEVICE_ID");
                    const response = await authService.refreshToken({
                        accessToken,
                        refreshToken,
                        deviceId,
                    });
                    const data = response.data;
                    if (data?.isSuccess) {
                        const newToken = data.data.accessToken;
                        const newRefreshToken = data.data.refreshToken;
                        const newDeviceId = data.data.deviceId;
                        localStorage.setItem("ACCESS_TOKEN", newToken);
                        localStorage.setItem("REFRESH_TOKEN", newRefreshToken);
                        localStorage.setItem("DEVICE_ID", newDeviceId);
                        processQueue(null, newToken);
                        if (originalRequest.headers) {
                            originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
                        }
                        return instance(originalRequest);
                    }
                    processQueue(error, null);
                    handleLogout();
                    return Promise.reject(error);

                } catch (err) {
                    processQueue(err, null);
                    handleLogout();
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
}

function handleLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;

    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("DEVICE_ID");

    window.location.href = "/login";
}


export function interceptorAPI(): AxiosInstance {
    if (!axiosInstance) {
        const instance = API.call();
        axiosInstance = attachInterceptors(instance);
    }
    return axiosInstance;
}