const throwError = require("@/utils/throw_error.util");

const validatorRegister = (req, res, next) => {
    try {
        let { email, password, confirmPassword, provider } = req.body;

        provider = (provider || "EMAIL").toUpperCase().trim();

        const validProviders = ["EMAIL", "GOOGLE"];

        if (!validProviders.includes(provider)) {
            throwError("Provider không hợp lệ!", 400);
        }

        if (!email || email.trim() === "") {
            throwError("Email không được rỗng!", 400);
        }

        email = email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throwError("Email không hợp lệ!", 400);
        }

        if (provider === "EMAIL") {
            if (!password) {
                throwError("Mật khẩu không được rỗng!", 400);
            }

            if (password.length < 6) {
                throwError("Mật khẩu phải ít nhất 6 ký tự!", 400);
            }

            if (!confirmPassword) {
                throwError("Xác nhận mật khẩu không được rỗng!", 400);
            }

            if (password !== confirmPassword) {
                throwError("Mật khẩu và xác nhận mật khẩu không khớp!", 400);
            }
        }

        if (provider === "GOOGLE" && password) {
            throwError("Google login không cần mật khẩu!", 400);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validatorRegister
};