const socketAuth = require("@middlewares/socket.middleware");

module.exports = (io) => {
    io.use(socketAuth); 

    io.on("connection", (socket) => {
        console.log(
            `User ${socket.user.userId} connected`
        );

        require("./rescuer.socket")(socket, io);
        require("./rescue.socket")(socket, io);

        // Khi đăng xuất
        require("./connection.socket")(socket, io);
    });
};