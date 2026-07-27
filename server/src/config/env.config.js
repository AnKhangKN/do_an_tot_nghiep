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
};

