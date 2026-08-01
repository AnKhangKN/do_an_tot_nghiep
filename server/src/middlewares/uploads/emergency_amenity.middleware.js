const { createUploader } = require("./uploader.factory");

// Khởi tạo uploader lưu ảnh tiện ích khẩn cấp vào 'do_an_tot_nghiep/amenities', giới hạn 5MB
const amenityUploader = createUploader({
  folder: "do_an_tot_nghiep/amenities",
  fileSize: 5 * 1024 * 1024, // 5MB
});

/**
 * Middleware upload 1 ảnh tùy chọn cho điểm tiện ích khẩn cấp (Field name: 'image')
 */
const uploadAmenityImage = amenityUploader.single("image");

module.exports = {
  uploadAmenityImage,
};
