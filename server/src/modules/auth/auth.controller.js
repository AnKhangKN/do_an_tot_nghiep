const authService = require("./auth.service");

class AuthController {
    register = async (req, res, next) => {
        try {
            const { email, password, provider, providerId } = req.body;
            console.log(email);

            const result = await authService.register({
                email,
                password,
                provider,
                providerId
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
}

module.exports = new AuthController();