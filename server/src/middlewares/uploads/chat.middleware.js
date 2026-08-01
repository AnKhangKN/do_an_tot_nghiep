const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh tin nhắn trò chuyện vào 'do_an_tot_nghiep/chat', giới hạn 5MB
const chatUploader = createUploader({
  folder: "do_an_tot_nghiep/chat",
  fileSize: 5 * 1024 * 1024, // 5MB
});

/**
 * Middleware upload 1 ảnh tin nhắn chat (Field name: 'image')
 */
const uploadChatImage = chatUploader.single("image");

/**
 * Middleware upload nhiều ảnh tin nhắn chat (Tối đa 5 ảnh, field name: 'images')
 */
const uploadChatImages = chatUploader.array("images", 5);

module.exports = {
  uploadChatImage,
  uploadChatImages,
};
