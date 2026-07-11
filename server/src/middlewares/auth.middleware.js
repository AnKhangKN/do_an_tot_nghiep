const { ACCESS_TOKEN } = require("@/config/env.config");
const jwt = require("jsonwebtoken");

const extractToken = (req) => {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
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
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

module.exports = {
    verifyToken
}