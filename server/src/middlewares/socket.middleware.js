const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("@config/env.config");

const socketAuth = (socket, next) => {
    try {

        const token = socket.handshake.auth?.token;
        
        console.log(socket.handshake.auth);

        // Trong socket.middleware.js
        const decoded = jwt.verify(token, ACCESS_TOKEN, {
            clockTolerance: 30 // Cho phép token lệch/quá hạn tối đa 30 giây vẫn chấp nhận
        });
        socket.user = decoded;

        next();
    } catch (error) {
        console.error("SOCKET AUTH ERROR:", error);

        next(new Error("Unauthorized"));
    }
};

module.exports = socketAuth;