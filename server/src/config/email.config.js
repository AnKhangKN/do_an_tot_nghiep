const nodemailer = require("nodemailer");
const envConfig = require("@/config/env.config");

const MAIL_DRIVER = (envConfig.MAIL_DRIVER || "smtp").toLowerCase();

const createTransporter = () => {
    if (MAIL_DRIVER === "brevo") {
        return nodemailer.createTransport({
            host: envConfig.BREVO_SMTP_SERVER || "smtp-relay.brevo.com",
            port: parseInt(envConfig.BREVO_PORT || "587", 10),
            secure: false, // STARTTLS
            auth: {
                user: envConfig.MAIL_USERNAME || "no-reply@cuuho.vn",
                pass: envConfig.BREVO_API_KEY
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000,
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    const port = parseInt(envConfig.MAIL_PORT || "587", 10);
    const isSSL = envConfig.MAIL_SSL_TLS === "true" || port === 465;

    return nodemailer.createTransport({
        host: envConfig.MAIL_SERVER || "smtp.gmail.com",
        port: port,
        secure: isSSL, // false cho port 587 (STARTTLS), true cho port 465 (Direct SSL)
        auth: {
            user: envConfig.MAIL_USERNAME,
            pass: envConfig.MAIL_PASSWORD
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
            rejectUnauthorized: false
        }
    });
};

module.exports = createTransporter;
