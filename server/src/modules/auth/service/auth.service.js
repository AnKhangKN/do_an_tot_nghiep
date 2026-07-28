const jwt = require("jsonwebtoken");
const throwError = require("@utils/throw_error.util");
const { transaction } = require("@/config/database.config");
const userService = require("../../user/services/user.service");
const user_authService = require("../../user_auth/service/user_auth.service");
const { REFRESH_TOKEN } = require("@/config/env.config");
const { generateAccessToken, generateRefreshToken } = require("@/utils/jwt.util");
const { comparePassword } = require("@/utils/password.util");
const rescuerService = require("@modules/rescuer/service/rescuer.service");

class AuthService {
    constructor() {
        this.userService = userService
        this.user_authService = user_authService
        this.rescuerService = rescuerService
    }

    register = async ({
        email,
        provider,
        providerId,
        password,
    }) => {
        return await transaction(async (client) => {
            const cleanEmail = email.trim().toLowerCase();
            const existingUser = await this.userService.getUserIdByEmail(client, { email: cleanEmail });

            let user;
            if (existingUser) {
                if (existingUser.isVerified) {
                    throwError("Tài khoản email này đã tồn tại và đã được xác thực!", 400);
                }
                user = existingUser;
            } else {
                user = await this.userService.createUser(client, { email: cleanEmail });
                await this.user_authService.createUserAuth(client, { userId: user.userId, provider, providerId, password });
            }

            // Sinh mã OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Lưu OTP vào Redis với thời gian sống 10 phút (600 giây)
            const redis = require("@config/redis.config");
            await redis.set(`otp:verify:${cleanEmail}`, otpCode, "EX", 600);

            // Gửi Email HTML chứa mã OTP
            const { sendOtpEmail } = require("@utils/mail.service");
            await sendOtpEmail({ toEmail: cleanEmail, otpCode });

            return {
                user,
                email: cleanEmail,
                message: "Đã gửi mã xác thực OTP 6 số tới Email của bạn. Mã có hiệu lực trong 10 phút."
            };
        });
    };

    verifyOtp = async ({ email, otpCode }) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otpCode.trim();

        const redis = require("@config/redis.config");
        const savedOtp = await redis.get(`otp:verify:${cleanEmail}`);

        if (!savedOtp) {
            throwError("Mã xác thực OTP đã hết hạn (quá 10 phút) hoặc không tồn tại. Vui lòng bấm gửi lại mã mới!", 400);
        }

        if (savedOtp !== cleanOtp) {
            throwError("Mã xác thực OTP 6 số không chính xác!", 400);
        }

        return await transaction(async (client) => {
            const updatedUser = await this.userService.updateIsVerified(client, { email: cleanEmail, isVerified: true });

            if (!updatedUser) {
                throwError("Không tìm thấy tài khoản người dùng!", 404);
            }

            // Xóa key OTP trên Redis sau khi xác thực thành công
            await redis.del(`otp:verify:${cleanEmail}`);

            // Tự động sinh Access Token + Refresh Token để vào thẳng ứng dụng
            const accessToken = await generateAccessToken({
                userId: updatedUser.userId,
                role: updatedUser.role || "VICTIM"
            });

            const refreshToken = await generateRefreshToken({
                userId: updatedUser.userId,
                role: updatedUser.role || "VICTIM"
            });

            return {
                accessToken,
                refreshToken,
                user: updatedUser
            };
        });
    };

    resendOtp = async ({ email }) => {
        const cleanEmail = email.trim().toLowerCase();
        const user = await this.userService.getUserIdByEmail(null, { email: cleanEmail });

        if (!user) {
            throwError("Không tìm thấy thông tin email tài khoản!", 404);
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const redis = require("@config/redis.config");
        await redis.set(`otp:verify:${cleanEmail}`, otpCode, "EX", 600);

        const { sendOtpEmail } = require("@utils/mail.service");
        await sendOtpEmail({ toEmail: cleanEmail, otpCode });

        return {
            email: cleanEmail,
            message: "Đã gửi lại mã xác thực OTP 6 số mới tới Email!"
        };
    };

    loginWithGoogle = async ({ email, providerId, fullName, avatarUrl, idToken }) => {
        let verifiedEmail = email ? email.trim().toLowerCase() : "";
        let verifiedProviderId = providerId ? providerId.toString().trim() : "";
        let verifiedFullName = fullName ? fullName.trim() : "";
        let verifiedAvatarUrl = avatarUrl ? avatarUrl.trim() : "";

        // Nếu client truyền idToken, xác thực trực tiếp qua google-auth-library để chống giả mạo
        if (idToken) {
            const { verifyGoogleIdToken } = require("@utils/google_auth.util");
            const payload = await verifyGoogleIdToken(idToken);

            if (payload) {
                verifiedEmail = payload.email ? payload.email.toLowerCase() : verifiedEmail;
                verifiedProviderId = payload.sub || verifiedProviderId;
                verifiedFullName = payload.name || verifiedFullName;
                verifiedAvatarUrl = payload.picture || verifiedAvatarUrl;
            } else {
                console.warn("⚠️ [GOOGLE AUTH WARN] Khai thác thông tin trực tiếp từ Google Account:", verifiedEmail);
            }
        }

        if (!verifiedEmail) {
            throwError("Email xác thực Google không được để trống!", 400);
        }

        const cleanProviderId = verifiedProviderId || verifiedEmail;

        return await transaction(async (client) => {
            let user = await this.userService.getUserIdByEmail(client, { email: verifiedEmail });

            if (!user || !user.userId) {
                // Tự động tạo tài khoản mới nếu chưa tồn tại với is_verified = true
                user = await this.userService.createUser(client, {
                    email: verifiedEmail,
                    fullName: verifiedFullName || verifiedEmail.split("@")[0],
                    avatarUrl: verifiedAvatarUrl || null,
                    isVerified: true
                });

                await this.user_authService.createUserAuth(client, {
                    userId: user.userId,
                    provider: "GOOGLE",
                    providerId: cleanProviderId,
                    password: null
                });
            } else {
                // Tài khoản đã có sẵn -> Cập nhật thông tin Google Profile & is_verified = true
                const updatedUser = await this.userService.updateGoogleProfile(client, {
                    userId: user.userId,
                    fullName: verifiedFullName || user.fullName,
                    avatarUrl: verifiedAvatarUrl || user.avatarUrl,
                    isVerified: true
                });
                if (updatedUser) {
                    user = { ...user, ...updatedUser };
                }
            }

            // Tự động sinh Access Token + Refresh Token
            const accessToken = await generateAccessToken({
                userId: user.userId,
                role: user.role || "VICTIM"
            });

            const refreshToken = await generateRefreshToken({
                userId: user.userId,
                role: user.role || "VICTIM"
            });

            return {
                accessToken,
                refreshToken,
                user
            };
        });
    };

    guestLogin = async ({ phone, fullName }) => {
        return await transaction(async (client) => {
            const cleanPhone = phone.trim();
            const email = `guest_${cleanPhone}@sos.guest`;

            let user = await this.userService.findUserByPhone(client, { phone: cleanPhone });

            if (!user) {
                user = await this.userService.createUser(client, {
                    email,
                    fullName: fullName || "Nạn nhân Khách",
                    phone: cleanPhone,
                });
            }

            const accessToken = await generateAccessToken({
                userId: user.userId,
                role: user.role || "VICTIM",
                isGuest: true,
            });

            const refreshToken = await generateRefreshToken({
                userId: user.userId,
                role: user.role || "VICTIM",
                isGuest: true,
            });

            return { accessToken, refreshToken, user };
        });
    };

    handleRefreshToken = async ({ refreshToken }) => {
        try {
            const userAuth = await jwt.verify(refreshToken, REFRESH_TOKEN);

            if (userAuth.isGuest) {
                throwError("Tài khoản khách tạm thời đã hết thời hạn sử dụng!", 401);
            }

            return await transaction(async (client) => {
                const user = await this.userService.getUserAuthInfo(client, { userId: userAuth.userId });

                if (!user || !user.userId) {
                    throwError("Tài khoản không tồn tại hoặc đã bị xóa. Vui lòng đăng nhập lại!", 401);
                }

                if (user.email && user.email.endsWith('@sos.guest')) {
                    throwError("Tài khoản khách tạm thời đã hết thời hạn sử dụng!", 401);
                }

                const newAccessToken = await generateAccessToken({
                    userId: userAuth.userId,
                    role: user.role
                });

                return { accessToken: newAccessToken };
            });
        } catch (error) {
            throwError(error.message || "Làm mới token thất bại!", error.statusCode || 401);
        }
    }

    loginNormal = async ({ email, password }) => {
        return await transaction(async (client) => {
            const cleanEmail = email ? email.trim().toLowerCase() : "";
            const user = await this.userService.getUserIdByEmail(client, { email: cleanEmail });

            if (!user || !user.userId) {
                throwError("Email hoặc mật khẩu không chính xác!", 400);
            }

            const storedPassword = await this.user_authService.getPasswordByUserId(client, { userId: user.userId });

            if (!storedPassword || !storedPassword.password) {
                throwError("Email hoặc mật khẩu không chính xác!", 400);
            }

            // So sánh mật khẩu đã hash với mật khẩu người dùng nhập vào
            const isPasswordValid = await comparePassword(password, storedPassword.password);

            if (!isPasswordValid) {
                throwError("Email hoặc mật khẩu không chính xác!", 400);
            }

            // Kiểm tra trạng thái xác thực Email (trừ tài khoản khách guest)
            if (!user.isVerified && !cleanEmail.endsWith('@sos.guest')) {
                // Tự động sinh mã OTP 6 số mới và gửi về Email cho người dùng
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                const redis = require("@config/redis.config");
                await redis.set(`otp:verify:${cleanEmail}`, otpCode, "EX", 600);

                const { sendOtpEmail } = require("@utils/mail.service");
                await sendOtpEmail({ toEmail: cleanEmail, otpCode });

                const err = new Error("Tài khoản chưa xác thực Email. Đã gửi mã OTP xác thực mới tới Email của bạn!");
                err.statusCode = 403;
                err.requireOtp = true;
                err.email = cleanEmail;
                throw err;
            }

            const accessToken = await generateAccessToken({
                userId: user.userId,
                role: user.role || "VICTIM"
            });

            const refreshToken = await generateRefreshToken({
                userId: user.userId,
                role: user.role || "VICTIM"
            });

            return { accessToken, refreshToken, user };
        });
    };

    getMe = async ({ userId }) => {
        return await transaction(async (client) => {
            const user = await this.userService.getUserAuthInfo(client, { userId });

            if (!user || !user.userId) {
                throwError("Không tìm thấy người dùng!", 404);
            }

            const result = {
                ...user,
            };

            if (user.role === "RESCUER") {
                const rescuer = await this.rescuerService.getRescuerAuthInfo(
                    client,
                    { userId }
                );

                result.rescuer = rescuer;
            }

            return result;
        });
    };
}

module.exports = new AuthService();