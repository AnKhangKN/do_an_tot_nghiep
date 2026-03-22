const UserAuthModel = {
    table: "user_auth",

    field: {
        userAuthId: "user_auth_id",
        userId: "user_id",
        provider: "provider",
        providerId: "provider_id",
        password: "password"
    }
}

module.exports = UserAuthModel