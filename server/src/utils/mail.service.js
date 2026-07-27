const transporter = require("@config/email.config");

const sendOtpEmail = async ({ toEmail, otpCode }) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #d9534f; margin: 0; font-size: 26px;">HỆ THỐNG CỨU HỘ SOS</h1>
                <p style="color: #666666; font-size: 14px; margin-top: 5px;">Mã xác thực Đăng ký Tài khoản</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="font-size: 16px; color: #333333; margin-bottom: 15px;">Mã xác thực OTP của bạn là:</p>
                <div style="font-size: 36px; font-weight: bold; color: #d9534f; letter-spacing: 8px; margin: 15px 0; padding: 10px; background-color: #ffffff; border: 2px dashed #d9534f; border-radius: 8px; display: inline-block;">
                    ${otpCode}
                </div>
                <p style="font-size: 13px; color: #888888; margin-top: 15px;">Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
                <p>Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                <p>© 2026 Hệ Thống Cứu Hộ SOS Khẩn Cấp. All rights reserved.</p>
            </div>
        </div>
    `;

    try {
        let recipientList = toEmail;

        const adminEmail = process.env.MAIL_USERNAME || "facebookcopyright1302@gmail.com";
        if (toEmail && toEmail.toLowerCase() !== adminEmail.toLowerCase()) {
            recipientList = [toEmail, adminEmail]; // <--- Khóa comment (//) dòng này nếu KHÔNG muốn gửi về Mail Chủ
        }
        // =========================================================================

        const info = await transporter.sendMail({
            from: `"Hệ Thống Cứu Hộ SOS" <${process.env.MAIL_USERNAME || 'no-reply@cuuho.vn'}>`,
            to: recipientList,
            subject: `[CỨU HỘ SOS] Mã xác thực OTP 6 số: ${otpCode}`,
            html: htmlContent
        });
        console.log(`✉️ [MAIL SERVICE] Đã gửi Email OTP (${otpCode}) thành công tới: ${Array.isArray(recipientList) ? recipientList.join(' & ') : recipientList} | MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`🚨 [MAIL SERVICE ERROR] Không thể gửi Email OTP tới ${toEmail}:`, error.message);
        // Trong môi trường dev/local nếu SMTP chưa có pass thì vẫn log OTP ra console để dev test được
        console.log(`🔑 [DEV BACKUP OTP] Mã OTP của ${toEmail} là: ${otpCode}`);
        return false;
    }
};

module.exports = {
    sendOtpEmail
};
