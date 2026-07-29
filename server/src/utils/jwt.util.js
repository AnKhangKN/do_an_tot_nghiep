const { ACCESS_TOKEN, REFRESH_TOKEN } = require('@/config/env.config');
const jwt = require('jsonwebtoken');

const generateAccessToken = async (payload) => {
    // Tài khoản Guest có hiệu lực 1 ngày, tài khoản thường 1 giờ
    const expiresIn = payload?.isGuest ? "1d" : "1h";
    return jwt.sign(payload, ACCESS_TOKEN, {
        expiresIn
    });
};

const generateRefreshToken = async (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN, {
        expiresIn: "30d"
    })
}

module.exports = {
    generateAccessToken, generateRefreshToken
}