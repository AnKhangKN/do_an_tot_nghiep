import { store } from "@/store";
import { setCredentials } from "@/store/accessToken/accessTokenSlice";
import { setBanned } from "@/store/ban/banSlice";
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

        if (error.response?.status === 403) {
            const msg = error.response?.data?.message || '';
            if (msg.includes('đã bị khóa')) {
                store.dispatch(setBanned({
                    reason: error.response?.data?.data?.ban_reason || msg,
                }));
                return Promise.reject(error);
            }
        }

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

export const logout = async () => {
    const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
            { email },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Forgot password error:", error);
        throw error;
    }
};

export const resetPassword = async (email, otpCode, newPassword, confirmPassword) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
            { email, otpCode, newPassword, confirmPassword },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("Reset password error:", error);
        throw error;
    }
};

export const appealBan = async (reason) => {
    try {
        const response = await axiosJWT.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/appeal-ban`,
            { reason }
        );
        return response.data;
    } catch (error) {
        console.error("Appeal ban error:", error);
        throw error;
    }
};

export const appealBanPublic = async (email, reason) => {
    try {
        const response = await axiosJWT.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/appeal`,
            { email, reason }
        );
        return response.data;
    } catch (error) {
        console.error("Appeal ban public error:", error);
        throw error;
    }
};

export const checkAppealStatus = async (email) => {
    try {
        const response = await axiosJWT.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/appeal-status`,
            { email }
        );
        return response.data;
    } catch (error) {
        console.error("Check appeal status error:", error);
        throw error;
    }
};

