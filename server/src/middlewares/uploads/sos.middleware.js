const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh hiện trường ca cứu hộ SOS vào 'do_an_tot_nghiep/sos_requests', giới hạn 5MB
const sosUploader = createUploader({
  folder: "do_an_tot_nghiep/sos_requests",
  fileSize: 5 * 1024 * 1024, // 5MB
});

/**
 * Middleware upload 1 ảnh hiện trường tùy chọn cho yêu cầu cứu hộ SOS (Field name: 'image')
 */
const uploadSosImage = sosUploader.single("image");

module.exports = {
  uploadSosImage,
};
