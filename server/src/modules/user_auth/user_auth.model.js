const UserAuthModel = {
    table: "user_auth",

    field: {
        userAuthId: "user_auth_id",
        userId: "user_id",

        // Phương thức đăng nhập Google, email
        provider: "provider", 

        // Sẽ có id nếu là đăng nhập bằng Google
        providerId: "provider_id", 
        password: "password"
    }
}

module.exports = UserAuthModel