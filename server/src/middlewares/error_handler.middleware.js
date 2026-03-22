const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ nội bộ";

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
