const deviceTokenModel = {
    table: "device_tokens",

    field: {
        deviceTokensId: 'device_tokens_id',
        userId: 'user_id',
        token: 'token',
        platform: 'platform',
        createdAt: 'created_at'
    }
}

module.exports = deviceTokenModel;
