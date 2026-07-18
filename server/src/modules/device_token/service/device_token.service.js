const uuidUtil = require("@/utils/uuid.util");
const deviceTokenRepository = require("../repository/device_token.repository");
const { transaction } = require("@/config/database.config");

class DeviceTokenService {
    registerToken = async ({ userId, token, platform }) => {
        return await transaction(async (client) => {
            const deviceTokensId = uuidUtil.generateUUID();
            return await deviceTokenRepository.upsertToken(client, {
                deviceTokensId,
                userId,
                token,
                platform
            });
        });
    }

    getTokensByUser = async ({ userId }) => {
        const rows = await deviceTokenRepository.getTokensByUserId({ userId });
        return rows.map(row => row.token);
    }

    unregisterToken = async ({ token }) => {
        return await deviceTokenRepository.deleteTokenByToken({ token });
    }
}

module.exports = new DeviceTokenService();
