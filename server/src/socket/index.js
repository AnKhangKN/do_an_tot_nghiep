module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("connected:", socket.id);

        require("./rescuer.socket")(socket, io);
        require("./rescue.socket")(socket, io);
    });
};