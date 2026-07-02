const socketAuth = require("@middlewares/socket.middleware");

module.exports = (io) => {
    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log(
            `User ${socket.user.userId} connected`
        );

        const { userId, role } = socket.user;

        socket.join(`user:${userId}`);
        
        if (role === "RESCUER") {
            socket.join(`rescuer:${userId}`);
        }

        console.log(`Người dùng ${userId} đã join vào room.`)

        require("./rescuer.socket")(socket, io); 
        require("./rescuer_location.socket")(socket, io);

        // Khi đăng xuất
        require("./connection.socket")(socket, io);
    });
};