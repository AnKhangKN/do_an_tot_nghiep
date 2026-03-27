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

    login = async (req, res, next) => {
        try {
            
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AuthController();