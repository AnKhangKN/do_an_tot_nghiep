const { createUploader } = require("./uploader.factory");
const { uploadAvatar, uploadAvatarImage } = require("./avatar.middleware");
const {
  uploadDangerousPointImages,
  uploadDangerousPointSingle,
} = require("./dangerous_point.middleware");
const {
  uploadEmergencyImages,
  uploadEmergencySingle,
} = require("./emergency.middleware");
const { uploadChatImage, uploadChatImages } = require("./chat.middleware");
const { uploadAmenityImage } = require("./emergency_amenity.middleware");
const { uploadSosImage } = require("./sos.middleware");

module.exports = {
  createUploader,

  // Avatar upload middlewares
  uploadAvatar,
  uploadAvatarImage,

  // Dangerous point upload middlewares
  uploadDangerousPointImages,
  uploadDangerousPointSingle,

  // Emergency / SOS upload middlewares
  uploadEmergencyImages,
  uploadEmergencySingle,
  uploadSosImage,

  // Chat upload middlewares
  uploadChatImage,
  uploadChatImages,

  // Emergency Amenity upload middleware
  uploadAmenityImage,
};


