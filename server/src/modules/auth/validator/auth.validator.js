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

const validatorGuestLogin = (req, res, next) => {
    try {
        let { phone, fullName } = req.body;

        if (!phone || phone.trim() === "") {
            throwError("Số điện thoại không được để trống!", 400);
        }

        phone = phone.trim();

        // Validate SĐT chuẩn Việt Nam (10 chữ số, đầu 03/05/07/08/09)
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

        if (!phoneRegex.test(phone)) {
            throwError("Số điện thoại không đúng định dạng! Vui lòng nhập SĐT Việt Nam 10 chữ số (ví dụ: 0912345678).", 400);
        }

        req.body.phone = phone;
        req.body.fullName = fullName && fullName.trim() !== "" ? fullName.trim() : "Nạn nhân Khách";

        next();
    } catch (error) {
        next(error);
    }
};

const validatorVerifyOtp = (req, res, next) => {
    try {
        let { email, otpCode } = req.body;

        if (!email || email.trim() === "") {
            throwError("Email không được để trống!", 400);
        }

        if (!otpCode || otpCode.trim() === "") {
            throwError("Mã xác thực 6 số không được để trống!", 400);
        }

        otpCode = otpCode.trim();

        if (!/^\d{6}$/.test(otpCode)) {
            throwError("Mã xác thực OTP phải đúng 6 chữ số!", 400);
        }

        req.body.email = email.trim().toLowerCase();
        req.body.otpCode = otpCode;

        next();
    } catch (error) {
        next(error);
    }
};

const validatorResendOtp = (req, res, next) => {
    try {
        let { email } = req.body;

        if (!email || email.trim() === "") {
            throwError("Email không được để trống!", 400);
        }

        req.body.email = email.trim().toLowerCase();

        next();
    } catch (error) {
        next(error);
    }
};

const validatorGoogleLogin = (req, res, next) => {
    try {
        let { email, providerId, fullName, avatarUrl, idToken } = req.body;

        if ((!email || email.trim() === "") && (!idToken || idToken.trim() === "")) {
            throwError("Thông tin xác thực Google không được để trống!", 400);
        }

        req.body.email = email ? email.trim().toLowerCase() : "";
        req.body.providerId = providerId ? providerId.toString().trim() : "";
        req.body.fullName = fullName ? fullName.trim() : "";
        req.body.avatarUrl = avatarUrl ? avatarUrl.trim() : "";
        req.body.idToken = idToken ? idToken.trim() : "";

        next();
    } catch (error) {
        next(error);
    }
};

const validatorForgotPassword = (req, res, next) => {
    try {
        let { email } = req.body;

        if (!email || email.trim() === "") {
            throwError("Email không được để trống!", 400);
        }

        email = email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throwError("Email không hợp lệ!", 400);
        }

        req.body.email = email.toLowerCase();

        next();
    } catch (error) {
        next(error);
    }
};

const validatorResetPassword = (req, res, next) => {
    try {
        let { email, otpCode, newPassword, confirmPassword } = req.body;

        if (!email || email.trim() === "") {
            throwError("Email không được để trống!", 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throwError("Email không hợp lệ!", 400);
        }

        req.body.email = email.trim().toLowerCase();

        if (!otpCode || otpCode.trim() === "") {
            throwError("Mã OTP không được để trống!", 400);
        }

        otpCode = otpCode.trim();
        if (!/^\d{6}$/.test(otpCode)) {
            throwError("Mã OTP phải đúng 6 chữ số!", 400);
        }

        req.body.otpCode = otpCode;

        if (!newPassword) {
            throwError("Mật khẩu mới không được để trống!", 400);
        }

        if (newPassword.length < 6) {
            throwError("Mật khẩu mới phải ít nhất 6 ký tự!", 400);
        }

        if (!confirmPassword) {
            throwError("Xác nhận mật khẩu không được để trống!", 400);
        }

        if (newPassword !== confirmPassword) {
            throwError("Mật khẩu mới và xác nhận mật khẩu không khớp!", 400);
        }

        req.body.newPassword = newPassword;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validatorRegister,
    validatorGuestLogin,
    validatorVerifyOtp,
    validatorResendOtp,
    validatorGoogleLogin,
    validatorForgotPassword,
    validatorResetPassword,
};