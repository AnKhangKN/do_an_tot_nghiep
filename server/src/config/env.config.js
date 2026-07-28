const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

module.exports = {
  // PORT
  PORT: process.env.PORT,

  // FRONTEND
  FRONTEND_URL: process.env.FRONTEND_URL,

  // DATABASE
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  // REDIS
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,

  // JWT
  ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,

  // COOKIE
  COOKIE_SECURE: process.env.COOKIE_SECURE,

  // CLOUDINARY
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,

  // GROQ AI
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_API_URL: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions",
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",

  // GOOGLE AUTH
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  // MAIL
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_SERVER: process.env.MAIL_SERVER,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_STARTTLS: process.env.MAIL_STARTTLS,
  MAIL_SSL_TLS: process.env.MAIL_SSL_TLS,
};

