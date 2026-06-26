const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("@config/env.config");

const socketAuth = (socket, next) => {
    try {

        const token = socket.handshake.auth?.token;

        const decoded = jwt.verify(token, ACCESS_TOKEN);
        socket.user = decoded;

        next();
    } catch (error) {
        console.error("SOCKET AUTH ERROR:", error);

        next(new Error("Unauthorized"));
    } 
};

module.exports = socketAuth;