const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh điểm nguy hiểm vào 'do_an_tot_nghiep/dangerous_points', giới hạn 10MB
const dangerousPointUploader = createUploader({
  folder: "do_an_tot_nghiep/dangerous_points",
  fileSize: 10 * 1024 * 1024, // 10MB
});

/**
 * Middleware upload nhiều ảnh điểm nguy hiểm (Tối đa 5 ảnh, field name: 'images')
 */
const uploadDangerousPointImages = dangerousPointUploader.array("images", 5);

/**
 * Middleware upload 1 ảnh điểm nguy hiểm (Field name: 'image')
 */
const uploadDangerousPointSingle = dangerousPointUploader.single("image");

module.exports = {
  uploadDangerousPointImages,
  uploadDangerousPointSingle,
};
