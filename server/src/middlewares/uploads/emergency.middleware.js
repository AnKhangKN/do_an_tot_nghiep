const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh sự cố khẩn cấp (SOS) vào 'do_an_tot_nghiep/emergencies', giới hạn 10MB
const emergencyUploader = createUploader({
  folder: "do_an_tot_nghiep/emergencies",
  fileSize: 10 * 1024 * 1024, // 10MB
});

/**
 * Middleware upload nhiều ảnh báo cáo sự cố khẩn cấp (Tối đa 5 ảnh, field name: 'images')
 */
const uploadEmergencyImages = emergencyUploader.array("images", 5);

/**
 * Middleware upload 1 ảnh báo cáo sự cố khẩn cấp (Field name: 'image')
 */
const uploadEmergencySingle = emergencyUploader.single("image");

module.exports = {
  uploadEmergencyImages,
  uploadEmergencySingle,
};
