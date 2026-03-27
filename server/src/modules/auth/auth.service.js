const throwError = require("@utils/throw_error.util");
const { transaction } = require("@/config/database.config");
const userService = require("../user/user.service");
const user_authService = require("../user_auth/user_auth.service");

class AuthService {
    constructor() {
        this.userService = userService
        this.user_authService = user_authService
    }

    register = async ({
        email,
        provider,
        providerId,
        password,
    }) => {
        return await transaction(async (client) => {
            const isExist = await this.userService.exists(client, { email })

            if (isExist) {
                throwError("Người dùng đã tồn tại!", 400);
            }

            const user = await this.userService.createUser(client, { email })

            const userId = user.user_id

            const userAuth = await this.user_authService.createUserAuth(client, { userId, provider, providerId, password })

            return {
                user,
                user_auth: userAuth
            }
        })
    };
}

module.exports = new AuthService();