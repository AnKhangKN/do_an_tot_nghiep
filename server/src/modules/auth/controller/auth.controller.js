const authService = require("../service/auth.service");
const { COOKIE_SECURE } = require("../../../config/env.config"); 

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
            const { data, platform } = req.body

            if (platform === "MOBILE") {
                const refreshToken = data
                const result = await authService.handleRefreshToken({ refreshToken })

                return res.status(200).json({
                    success: true,
                    message: "Lấy token thành công",
                    data: result,
                });

            } else if (platform === "WEB") {
                const refreshToken = req.cookies.refreshToken;

                const result = await authService.handleRefreshToken({ refreshToken })

                return res.status(200).json({
                    success: true,
                    message: "Lấy token thành công",
                    data: result,
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Nền tảng không hợp lệ!"
                })
            }


        } catch (error) {
            next(error);
        }
    }

    login = async (req, res, next) => {
        try {
            const { email, password, platform } = req.body;

            const result = await authService.loginNormal({ email, password });
            const { accessToken, refreshToken } = result;

            if (platform === "WEB") {
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: COOKIE_SECURE,
                    sameSite: "strict",
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
            next(error)
        }
    }

    // TODO: Xử lý sau

    loginWithGoogle = async (req, res, next) => {
        // try {
        //     const { email, providerId } = req.body;
        //     const result = await this.authService.loginWithGoogle({ email, providerId });

        //     return res.status(200).json({
        //         success: true,
        //         message: "Đăng nhập với Google thành công",
        //         data: result,
        //     });
        // } catch (error) {
        //     next(error);
        // }
    }

    logout = async (req, res, next) => {
        try {
            
        } catch (error) {
            next(error);
        }

    }

    verifyEmail = async (req, res, next) => {

    }

    forgotPassword = async (req, res, next) => {

    }

    resetPassword = async (req, res, next) => {

    }
}

module.exports = new AuthController();