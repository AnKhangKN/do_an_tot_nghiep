const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh vào thư mục 'do_an_tot_nghiep/avatars', giới hạn 3MB
const avatarUploader = createUploader({
  folder: "do_an_tot_nghiep/avatars",
  fileSize: 3 * 1024 * 1024, // 3MB
});

/**
 * Middleware upload 1 ảnh đại diện (Field name: 'avatar')
 */
const uploadAvatar = avatarUploader.single("avatar");

/**
 * Middleware upload 1 ảnh đại diện (Field name: 'image')
 */
const uploadAvatarImage = avatarUploader.single("image");

module.exports = {
  uploadAvatar,
  uploadAvatarImage,
};
