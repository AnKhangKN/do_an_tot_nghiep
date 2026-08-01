import axios from "axios";

export const getPublicThesisInfo = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/public/settings/thesis-info`
        );
        return response.data;
    } catch (error) {
        console.error("Get public thesis info error:", error);
        throw error;
    }
};
