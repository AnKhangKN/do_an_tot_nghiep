const { ACCESS_TOKEN, REFRESH_TOKEN } = require('@/config/env.config');
const jwt = require('jsonwebtoken');

const generateAccessToken = async (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN, {
        expiresIn: "300s"
    })
}   

const generateRefreshToken = async (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN, {
        expiresIn: "365d"
    })
}

module.exports = {
    generateAccessToken, generateRefreshToken
}