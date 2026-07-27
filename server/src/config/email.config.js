const nodemailer = require("nodemailer");

const port = parseInt(process.env.MAIL_PORT || "587", 10);
const isSSL = process.env.MAIL_SSL_TLS === "true" || port === 465;

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER || "smtp.gmail.com",
    port: port,
    secure: isSSL, // false cho port 587 (STARTTLS), true cho port 465 (Direct SSL)
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;
