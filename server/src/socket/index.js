const socketAuth = require("@middlewares/socket.middleware");
const sessionSocket = require("../socket/session.socket");
const initRedisSubscriber = require("../socket/socket.subscriber");

let ioInstance = null;

const initSocket = (io) => {
    ioInstance = io;

    io.use(socketAuth);

    initRedisSubscriber(io);

    io.on("connection", async (socket) => {
        const { userId, role } = socket.user;

        console.log("role: ", role)

        // Xử lý "single active session": kick thiết bị cũ hoặc chặn thiết bị mới đang trong ca cứu hộ
        const takeover = await sessionSocket.handleSessionTakeover(io, socket);
        if (takeover === "blocked") {
            return;
        }

        socket.join(`user:${userId}`);

        if (role === "RESCUER") {
            socket.join(`rescuer:${userId}`);
            console.log(`Mã phòng khi "Rescuer" join room: rescuer:${userId}`);

            // Hủy lịch hẹn offline nếu có do kết nối lại
            const { cancelPendingOffline } = require("./connection.socket");
            cancelPendingOffline(userId);
        } else if (role === "VICTIM") {
            socket.join(`victim:${userId}`);
            console.log(`Mã phòng khi "Victim" join room: victim:${userId}`);
        } else if (role === "ADMIN") {
            socket.join(`admin:${userId}`);
            socket.join("admin:dashboard");
            console.log(`Mã phòng khi "Admin" join room: admin:${userId} và admin:dashboard`);
        } else {
            console.warn(`Unknown role: ${role} for user ${userId}`);
        }

        require("./chat.socket")(socket, io);
        require("./rescuer.socket")(socket, io);
        require("./rescuer_location.socket")(socket, io);

        // Khi đăng xuất
        require("./connection.socket")(socket, io);

        // Dọn dẹp active_session khi ngắt kết nối
        sessionSocket(socket, io);
    });
};

const getIO = () => ioInstance;

const emitAdminDashboardEvent = (eventType, payload = {}) => {
    if (ioInstance) {
        ioInstance.to("admin:dashboard").emit("dashboard:event", {
            type: eventType,
            timestamp: new Date().toISOString(),
            ...payload
        });
    }
};

module.exports = initSocket;
module.exports.getIO = getIO;
module.exports.emitAdminDashboardEvent = emitAdminDashboardEvent;