const authService = require("../service/auth.service");
const { COOKIE_SECURE, COOKIE_SAMESITE } = require("../../../config/env.config");

class AuthController {
    register = async (req, res, next) => {
        try {
            const { email, provider, providerId, password } = req.body;

            const result = await authService.register({
                email,
                provider,
                providerId,
                password,
            });

            return res.status(201).json({
                success: true,
                message: "Đăng ký thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    handleVerifyOtp = async (req, res, next) => {
        try {
            const { email, otpCode } = req.body;

            const result = await authService.verifyOtp({ email, otpCode });

            return res.status(200).json({
                success: true,
                message: "Xác thực Email thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    handleResendOtp = async (req, res, next) => {
        try {
            const { email } = req.body;

            const result = await authService.resendOtp({ email });

            return res.status(200).json({
                success: true,
                message: "Đã gửi lại mã OTP 6 số thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    handleRefreshToken = async (req, res, next) => {
        try {
            const { data, platform } = req.body;

            if (platform === "MOBILE") {
                const refreshToken = data || req.body.refreshToken;

                if (!refreshToken) {
                    return res.status(401).json({
                        success: false,
                        message: "Không tìm thấy token làm mới",
                    });
                }

                const result = await authService.handleRefreshToken({ refreshToken });

                return res.status(200).json({
                    success: true,
                    message: "Lấy token thành công",
                    data: result,
                });
            } else if (platform === "WEB") {
                const refreshToken = req.cookies.refreshToken;

                if (!refreshToken) {
                    return res.status(401).json({
                        success: false,
                        message: "Không tìm thấy token làm mới",
                    });
                }

                const result = await authService.handleRefreshToken({ refreshToken });

                return res.status(200).json({
                    success: true,
                    message: "Lấy token thành công",
                    data: result,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Nền tảng không hợp lệ!",
                });
            }
        } catch (error) {
            next(error);
        }
    };

    loginNormal = async (req, res, next) => {
        try {
            const { email, password, platform } = req.body;

            const result = await authService.loginNormal({ email, password });
            const { accessToken, refreshToken } = result;

            if (platform === "WEB") {
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: COOKIE_SECURE,
                    sameSite: COOKIE_SAMESITE,
                    maxAge: 365 * 24 * 60 * 60 * 1000,
                    path: "/",
                });

                return res.status(200).json({
                    success: true,
                    message: "Đăng nhập thành công",
                    data: { accessToken },
                });
            } else if (platform === "MOBILE") {
                return res.status(200).json({
                    success: true,
                    message: "Đăng nhập thành công",
                    data: { accessToken, refreshToken },
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Nền tảng không hợp lệ!",
                });
            }
        } catch (error) {
            if (error.requireOtp) {
                return res.status(403).json({
                    success: false,
                    requireOtp: true,
                    email: error.email,
                    message: error.message || "Tài khoản chưa được xác thực Email!"
                });
            }
            next(error);
        }
    };

    guestLogin = async (req, res, next) => {
        try {
            const { phone, fullName } = req.body;

            const result = await authService.guestLogin({ phone, fullName });

            return res.status(200).json({
                success: true,
                message: "Xác thực nạn nhân khách thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req, res, next) => {
        try {
            const userId = req.userId;
            const deviceId = req.body?.deviceId || req.headers?.['x-device-id'] || req.query?.deviceId;

            if (userId) {
                await authService.logout({ userId, deviceId });
            }

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: COOKIE_SECURE,
                sameSite: COOKIE_SAMESITE,
                path: "/",
            });

            return res.status(200).json({
                success: true,
                message: "Đăng xuất thành công",
            });
        } catch (error) {
            next(error);
        }
    };

    getMe = async (req, res, next) => {
        try {
            const userId = req.userId;

            const result = await authService.getMe({ userId });

            return res.status(200).json({
                success: true,
                message: "Lấy thông tin người dùng thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    loginWithGoogle = async (req, res, next) => {
        try {
            const { email, providerId, fullName, avatarUrl, idToken } = req.body;
            const result = await authService.loginWithGoogle({ email, providerId, fullName, avatarUrl, idToken });
            return res.status(200).json({
                success: true,
                message: "Đăng nhập với Google thành công!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    appealBan = async (req, res, next) => {
        try {
            const { reason } = req.body;
            const result = await authService.appealBan({ userId: req.userId, reason });
            return res.status(200).json({
                success: true,
                message: "Yêu cầu kháng cáo đã được gửi. Admin sẽ xem xét và phản hồi sớm nhất!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    appealBanPublic = async (req, res, next) => {
        try {
            const { email, reason } = req.body;
            if (!email || !email.trim()) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập email!" });
            }
            const result = await authService.appealBanByEmail({ email: email.trim().toLowerCase(), reason });
            return res.status(200).json({
                success: true,
                message: "Yêu cầu kháng cáo đã được gửi. Admin sẽ xem xét và phản hồi sớm nhất!",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    checkAppealStatus = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email || !email.trim()) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập email!" });
            }
            const result = await authService.checkAppealStatusByEmail({ email: email.trim().toLowerCase() });
            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    verifyEmail = async (req, res, next) => { };

    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;

            const result = await authService.forgotPassword({ email });

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req, res, next) => {
        try {
            const { email, otpCode, newPassword } = req.body;

            const result = await authService.resetPassword({ email, otpCode, newPassword });

            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AuthController();
