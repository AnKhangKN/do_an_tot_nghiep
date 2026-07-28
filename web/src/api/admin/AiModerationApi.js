import { axiosJWT } from "../shared/AuthApi";

export const getAiModerationLogs = async (params) => {
    try {
        const response = await axiosJWT.get("/api/ai-moderation/logs", { params });
        return response.data;
    } catch (error) {
        console.error("Get AI Moderation logs error:", error);
        throw error;
    }
};

export const reviewAiModerationLog = async (logId, actionTaken) => {
    try {
        const response = await axiosJWT.patch(`/api/ai-moderation/logs/${logId}/review`, { actionTaken });
        return response.data;
    } catch (error) {
        console.error("Review AI Moderation log error:", error);
        throw error;
    }
};
