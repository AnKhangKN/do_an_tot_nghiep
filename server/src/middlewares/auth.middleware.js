const { ACCESS_TOKEN } = require("@/config/env.config");
const jwt = require("jsonwebtoken");
const userRepository = require("@/modules/user/repository/user.repository");

const extractToken = (req) => {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer")) {
        return authHeader.split(" ")[1];
    }
    return null;
};

const verifyToken = (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.role !== "ADMIN") {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối. Bạn không có quyền Admin!" });
    }
    next();
};

const isRescuer = (req, res, next) => {
    if (req.role !== "RESCUER") {
        return res.status(403).json({ message: "Quyền truy cập bị từ chối. Yêu cầu vai trò Cứu hộ!" });
    }
    next();
};

const isNotBanned = async (req, res, next) => {
    try {
        const user = await userRepository.getUserStatus(req.userId);
        if (!user || user.status === "BANNED") {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Lỗi kiểm tra trạng thái tài khoản" });
    }
};

const optionalVerifyToken = (req, res, next) => {
    const token = extractToken(req);
    if (token) {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN);
            req.userId = decoded.userId;
            req.role = decoded.role;
        } catch (_) {}
    }
    next();
};

module.exports = {
    verifyToken,
    optionalVerifyToken,
    isAdmin,
    isRescuer,
    isNotBanned
}