import { axiosJWT } from "../shared/AuthApi";

export const getConversationsAdmin = async () => {
  try {
    const response = await axiosJWT.get("/api/chat/conversations");
    return response.data;
  } catch (error) {
    console.error("Get admin conversations error:", error);
    throw error;
  }
};

export const getMessagesAdmin = async (conversationId, limit = 50, offset = 0) => {
  try {
    const response = await axiosJWT.get(`/api/chat/conversations/${conversationId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Get admin messages error:", error);
    throw error;
  }
};

export const sendMessageAdmin = async (conversationId, content, partnerId) => {
  try {
    const response = await axiosJWT.post("/api/chat/messages", {
      conversationId,
      content,
      partnerId,
    });
    return response.data;
  } catch (error) {
    console.error("Send admin message error:", error);
    throw error;
  }
};
