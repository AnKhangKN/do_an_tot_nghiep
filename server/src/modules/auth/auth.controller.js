const authService = require("./auth.service");

class AuthController {
    register = async (req, res, next) => {
        try {
            const { email, provider, providerId, password } = req.body;

            const result = await authService.register({
                email,
                provider,
                providerId,
                password
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

    handleRefreshToken = async (req, res, next) => {
        try {
            const refreshToken = req.cookies.refreshToken;

            const result = await authService.handleRefreshToken({ refreshToken })

            return res.status(200).json({
                success: true,
                message: "Lấy token thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    loginNormal = async (req, res, next) => {
        try {
            const { email, password, platform } = req.body;

            const result = await authService.loginNormal({ email, password });

            if (platform === "WEB") {
                const { accessToken, user } = result;

                res.cookie("refreshToken", result.refreshToken, {
                    httpOnly: true,
                    secure: false, // Đổi thành true khi deploy với HTTPS
                    sameSite: "strict",
                    maxAge: 365 * 24 * 60 * 60 * 1000,
                    path: "/",
                });

                return res.status(200).json({
                    success: true,
                    message: "Đăng nhập thành công",
                    data: { accessToken, user },
                });
            } else if (platform === "MOBILE") {
                return res.status(200).json({
                    success: true,
                    message: "Đăng nhập thành công",
                    data: result,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Nền tảng không hợp lệ",
                });
            }

        } catch (error) {
            next(error)
        }
    }

    loginWithGoogle = async (req, res, next) => {
        try {
            const { email, providerId } = req.body;
            const result = await authService.loginWithGoogle({ email, providerId });

            return res.status(200).json({
                success: true,
                message: "Đăng nhập với Google thành công",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new AuthController();