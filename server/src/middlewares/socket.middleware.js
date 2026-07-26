const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("@config/env.config");
const userRepository = require("@modules/user/repository/user.repository");

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        const decoded = jwt.verify(token, ACCESS_TOKEN, {
            clockTolerance: 120
        });

        // Lấy thông tin user tươi mới nhất từ DB để cập nhật role đúng (phòng trường hợp Admin vừa duyệt nâng quyền)
        const freshUser = await userRepository.getUserInfoById({ userId: decoded.userId });

        socket.user = {
            ...decoded,
            role: freshUser?.role || decoded.role
        };

        next();
    } catch (error) {
        console.error("SOCKET AUTH ERROR:", error);

        next(new Error("Unauthorized"));
    }
};

module.exports = socketAuth;