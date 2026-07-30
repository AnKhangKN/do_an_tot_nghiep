const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi máy chủ nội bộ";

  const response = {
    success: false,
    message,
  };

  if (err.isBanned) {
    response.isBanned = true;
    response.banReason = err.banReason;
    response.bannedAt = err.bannedAt;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
