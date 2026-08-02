const createTransporter = require("@config/email.config");
const envConfig = require("@/config/env.config");

const MAIL_DRIVER = (envConfig.MAIL_DRIVER || "smtp").toLowerCase();

const getSenderEmail = () =>
    envConfig.MAIL_FROM || envConfig.MAIL_USERNAME || "no-reply@cuuho.vn";

const getAdminEmail = () => envConfig.MAIL_USERNAME || "facebookcopyright1302@gmail.com";

const sendEmail = async ({ to, subject, html }) => {
    if (MAIL_DRIVER === "log") {
        console.log(`[MAIL DRIVER=log] To: ${Array.isArray(to) ? to.join(", ") : to}`);
        console.log(`[MAIL DRIVER=log] Subject: ${subject}`);
        console.log(`[MAIL DRIVER=log] HTML: ${html}`);
        return { messageId: "log-only", driver: "log" };
    }

    const transporter = createTransporter();
    return await transporter.sendMail({
        from: `"Hệ Thống Cứu Hộ SOS" <${getSenderEmail()}>`,
        to,
        subject,
        html
    });
};

const sendOtpEmail = async ({ toEmail, otpCode, purpose = "register" }) => {
    const isForgotPassword = purpose === "forgotPassword";
    const title = isForgotPassword ? "Đặt lại Mật khẩu" : "Đăng ký Tài khoản";
    const headerText = isForgotPassword
        ? "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình."
        : "Mã xác thực OTP của bạn là:";
    const footerNote = isForgotPassword
        ? "Nếu bạn không thực hiện yêu cầu đặt lại mật khẩu này, vui lòng bỏ qua email này hoặc liên hệ quản trị viên."
        : "Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.";

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #d9534f; margin: 0; font-size: 26px;">HỆ THỐNG CỨU HỘ SOS</h1>
                <p style="color: #666666; font-size: 14px; margin-top: 5px;">Mã xác thực ${title}</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">${headerText}</p>
                <div style="font-size: 36px; font-weight: bold; color: #d9534f; letter-spacing: 8px; margin: 15px 0; padding: 10px; background-color: #ffffff; border: 2px dashed #d9534f; border-radius: 8px; display: inline-block;">
                    ${otpCode}
                </div>
                <p style="font-size: 13px; color: #888888; margin-top: 15px;">Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
                <p>${footerNote}</p>
                <p>© 2026 Hệ Thống Cứu Hộ SOS Khẩn Cấp. All rights reserved.</p>
            </div>
        </div>
    `;

    try {
        let recipientList = toEmail;

        if (MAIL_DRIVER === "smtp") {
            const adminEmail = getAdminEmail();
            if (toEmail && toEmail.toLowerCase() !== adminEmail.toLowerCase()) {
                recipientList = [toEmail, adminEmail];
            }
        }

        const info = await sendEmail({
            to: recipientList,
            subject: `[CỨU HỘ SOS] Mã OTP ${title}: ${otpCode}`,
            html: htmlContent
        });
        console.log(`✉️ [MAIL SERVICE][${MAIL_DRIVER}] Đã gửi Email OTP (${otpCode}) thành công tới: ${Array.isArray(recipientList) ? recipientList.join(' & ') : recipientList} | MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        const actualHost = MAIL_DRIVER === "brevo"
            ? (envConfig.BREVO_SMTP_SERVER || "smtp-relay.brevo.com")
            : (envConfig.MAIL_SERVER || "smtp.gmail.com");
        const actualPort = MAIL_DRIVER === "brevo"
            ? (envConfig.BREVO_PORT || 587)
            : (envConfig.MAIL_PORT || 587);
        console.error(`🚨 [MAIL SERVICE ERROR] Không thể gửi Email OTP tới ${toEmail} (driver=${MAIL_DRIVER}, host=${actualHost}, port=${actualPort}):`, error.message);
        console.log(`🔑 [DEV BACKUP OTP] Mã OTP của ${toEmail} là: ${otpCode}`);
        return false;
    }
};

module.exports = {
    sendEmail,
    sendOtpEmail
};
