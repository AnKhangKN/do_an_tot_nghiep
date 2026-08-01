const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("@config/upload.config");

/**
 * Factory tạo Multer Middleware để tải ảnh lên Cloudinary theo từng tính năng
 * @param {Object} options
 * @param {string} [options.folder] - Thư mục lưu trữ trên Cloudinary
 * @param {Array<string>} [options.allowedFormats] - Danh sách định dạng tệp cho phép
 * @param {number} [options.fileSize] - Dung lượng tệp tối đa (tính bằng Byte)
 * @returns {multer.Multer} Instance của Multer
 */
const createUploader = ({
  folder = "do_an_tot_nghiep/general",
  allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"],
  fileSize = 5 * 1024 * 1024,
} = {}) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép tải lên định dạng hình ảnh!"), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: fileSize },
  });
};

module.exports = {
  createUploader,
};
