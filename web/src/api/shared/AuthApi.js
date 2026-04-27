import { store } from "@/store";
import { setCredentials } from "@/store/accessToken/accessTokenSlice";
import axios from "axios";

export const axiosJWT = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Request interceptor
axiosJWT.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor
axiosJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const res = await refreshToken();

            const newAccessToken = res.data.accessToken;

            store.dispatch(setCredentials({ accessToken: newAccessToken }));

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return axiosJWT(originalRequest);
        }

        return Promise.reject(error);
    }
);

export const refreshToken = async (platform = "WEB") => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token`, {
            platform
        }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Refresh token error:", error);
        throw error;
    }
};

export const login = async (email, password, platform = "WEB") => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password, platform }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

