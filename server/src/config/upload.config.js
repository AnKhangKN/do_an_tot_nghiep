const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const env = require("./env.config");

// Cấu hình thông tin Cloudinary SDK
cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});


// Cấu hình Storage cho Multer để tải ảnh trực tiếp lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "do_an_tot_nghiep/images", // Thư mục lưu trữ ảnh trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"], // Định dạng tệp cho phép
  },
});

// Bộ lọc kiểm tra định dạng hình ảnh
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép tải lên định dạng hình ảnh!"), false);
  }
};

// Middleware upload Cloudinary bằng Multer
const uploadCloud = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước tệp 5MB
  },
});

module.exports = {
  cloudinary,
  storage,
  uploadCloud,
};
