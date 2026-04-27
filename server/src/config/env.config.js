const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` }); 

module.exports = {
  // PORT
  PORT: process.env.PORT || 8000,

  // FRONTEND
  FRONTEND_URL: process.env.FRONTEND_URL,

  // DATABASE
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  // jwt
  ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
  REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,

  // OSM
  PHOTON_API: process.env.PHOTON_API,
  OSM_API: process.env.OSM_API,

  // cookie
  COOKIE_SECURE: process.env.COOKIE_SECURE,
};
