const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("@config/env.config");
const userRepository = require("@modules/user/repository/user.repository");

const socketAuth = async (socket, next) => {
    try {
        let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
        
        if (!token) {
            return next(new Error("Token missing"));
        }

        // Tách bỏ tiền tố 'Bearer ' nếu có
        if (typeof token === 'string' && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        token = typeof token === 'string' ? token.trim() : token;

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
        if (error.name === "TokenExpiredError") {
            console.warn("⚠️ [SOCKET AUTH] JWT Token đã hết hạn (jwt expired)");
            return next(new Error("jwt expired"));
        }

        console.error("❌ [SOCKET AUTH ERROR]:", error.message);
        next(new Error("Unauthorized"));
    }
};

module.exports = socketAuth;