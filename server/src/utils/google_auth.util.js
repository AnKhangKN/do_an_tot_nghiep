const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

/**
 * Xác minh idToken trực tiếp với Google OAuth2 Server để ngăn chặn giả mạo dữ liệu
 * @param {string} idToken 
 * @returns {Promise<object | null>}
 */
const verifyGoogleIdToken = async (idToken) => {
    if (!idToken || typeof idToken !== "string" || !idToken.trim()) {
        return null;
    }

    try {
        const verifyOptions = {
            idToken: idToken.trim(),
        };

        if (process.env.GOOGLE_CLIENT_ID) {
            verifyOptions.audience = process.env.GOOGLE_CLIENT_ID;
        }

        const ticket = await client.verifyIdToken(verifyOptions);

        const payload = ticket.getPayload();
        return payload || null;
    } catch (error) {
        console.error("🚨 [GOOGLE VERIFY ERROR] Mã ID Token không hợp lệ:", error.message);
        return null;
    }
};

module.exports = {
    verifyGoogleIdToken,
};
