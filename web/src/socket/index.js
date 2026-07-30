import { getSocketInstance, disconnectSocket } from "./core/socketCore";
import { initConnectionListeners } from "./features/connection/connectionSocket";
import { listenDashboardEvents } from "./features/dashboard/dashboardSocket";
import { listenChatEvents, listenChatError, sendSocketChatMessage } from "./features/chat/chatSocket";
import { listenBanEvent } from "./features/ban/banSocket";

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

export const subscribeChatErrors = (onError) => {
  const socket = getSocketInstance();
  return listenChatError(socket, onError);
};

export const sendChatMessage = ({ conversationId, partnerId, content, messageType, tempId }) => {
  const socket = getSocketInstance();
  sendSocketChatMessage(socket, { conversationId, partnerId, content, messageType, tempId });
};

export const subscribeBanEvent = (onBanned) => {
  const socket = getSocketInstance();
  return listenBanEvent(socket, onBanned);
};

export default {
  getAdminSocket,
  disconnectAdminSocket,
  subscribeConnectionStatus,
  subscribeDashboardEvents,
  subscribeChatEvents,
  subscribeChatErrors,
  sendChatMessage,
  subscribeBanEvent,
};
