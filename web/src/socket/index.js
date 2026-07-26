import { getSocketInstance, disconnectSocket } from "./core/socketCore";
import { initConnectionListeners } from "./features/connection/connectionSocket";
import { listenDashboardEvents } from "./features/dashboard/dashboardSocket";

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

export default {
  getAdminSocket,
  disconnectAdminSocket,
  subscribeConnectionStatus,
  subscribeDashboardEvents,
};
