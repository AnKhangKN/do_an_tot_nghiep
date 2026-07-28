import { getSocketInstance, disconnectSocket } from "./core/socketCore";
import { initConnectionListeners } from "./features/connection/connectionSocket";
import { listenDashboardEvents } from "./features/dashboard/dashboardSocket";
import { listenChatEvents, sendSocketChatMessage } from "./features/chat/chatSocket";

export const getAdminSocket = () => {
  return getSocketInstance();
};

export const disconnectAdminSocket = () => {
  disconnectSocket();
};

export const subscribeConnectionStatus = (callbacks) => {
  const socket = getSocketInstance();
  return initConnectionListeners(socket, callbacks);
};

export const subscribeDashboardEvents = (onDashboardEvent) => {
  const socket = getSocketInstance();
  return listenDashboardEvents(socket, onDashboardEvent);
};

export const subscribeChatEvents = (onNewMessage) => {
  const socket = getSocketInstance();
  return listenChatEvents(socket, onNewMessage);
};

export const sendChatMessage = ({ conversationId, partnerId, content, messageType }) => {
  const socket = getSocketInstance();
  sendSocketChatMessage(socket, { conversationId, partnerId, content, messageType });
};

export default {
  getAdminSocket,
  disconnectAdminSocket,
  subscribeConnectionStatus,
  subscribeDashboardEvents,
  subscribeChatEvents,
  sendChatMessage,
};
