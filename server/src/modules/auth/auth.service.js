const jwt = require("jsonwebtoken");
const throwError = require("@utils/throw_error.util");
const { transaction } = require("@/config/database.config");
const userService = require("../user/user.service");
const user_authService = require("../user_auth/user_auth.service");
const { REFRESH_TOKEN } = require("@/config/env.config");
const { generateAccessToken, generateRefreshToken } = require("@/utils/jwt.util");
const { comparePassword } = require("@/utils/hash_password.util");

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

    handleRefreshToken = async ({ refreshToken }) => {
        try {

            const userAuth = await jwt.verify(refreshToken, REFRESH_TOKEN);

            const newAccessToken = await generateAccessToken({
                userId: userAuth.userId,
                role: userAuth.role
            })

            return { accessToken: newAccessToken };

        } catch (error) {
            throwError("Làm mới token thất bại!", 400);
        }
    }

    loginNormal = async ({ email, password }) => {
        return await transaction(async (client) => {

            const user = await this.userService.getUserByEmail(client, { email });

            if (!user.user_id) {
                throwError("Không tồn tại user id!", 400);
            }

            const storedPassword = await this.user_authService.getPasswordByUserId(client, { userId: user.user_id });

            if (!storedPassword) {
                throwError("Không lấy được mật khẩu!", 400);
            }

            // So sánh mật khẩu đã hash với mật khẩu người dùng nhập vào
            const isPasswordValid = await comparePassword(password, storedPassword);

            if (!isPasswordValid) {
                throwError("Xác thực mật khẩu thất bại!", 400);
            }

            const accessToken = await generateAccessToken({
                userId: user.user_id,
                role: user.role
            });

            const refreshToken = await generateRefreshToken({
                userId: user.user_id,
                role: user.role
            });

            return { accessToken, refreshToken, user };
        })

    }

}

module.exports = new AuthService();