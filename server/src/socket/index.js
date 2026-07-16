const socketAuth = require("@middlewares/socket.middleware");
const initRedisSubscriber = require("../socket/socket.subscriber");

module.exports = (io) => {

    io.use(socketAuth);

    initRedisSubscriber(io);

    io.on("connection", (socket) => {
        const { userId, role } = socket.user;

        console.log("role: ", role)

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
            console.log(`Mã phòng khi "Admin" join room: admin:${userId}`);
        } else {
            console.warn(`Unknown role: ${role} for user ${userId}`);
        }

        require("./rescuer.socket")(socket, io);
        require("./rescuer_location.socket")(socket, io);

        // Khi đăng xuất
        require("./connection.socket")(socket, io);
    });
};