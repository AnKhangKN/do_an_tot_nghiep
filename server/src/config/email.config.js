const nodemailer = require("nodemailer");
const envConfig = require("@/config/env.config");

const port = parseInt(envConfig.MAIL_PORT || "587", 10);
const isSSL = envConfig.MAIL_SSL_TLS === "true" || port === 465;

const transporter = nodemailer.createTransport({
    host: envConfig.MAIL_SERVER || "smtp.gmail.com",
    port: port,
    secure: isSSL, // false cho port 587 (STARTTLS), true cho port 465 (Direct SSL)
    auth: {
        user: envConfig.MAIL_USERNAME,
        pass: envConfig.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;
