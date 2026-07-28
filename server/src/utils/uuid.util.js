const { v7 } = require("uuid");

// Tạo uuid v7
const generateUUID = () => v7();

// Kiểu tra id từ client gửi về để truy vấn (chỉ nhận uuid v7 đúng format)
const isValidUUID = (id) => {
    if (typeof id !== "string" || !id.trim()) return false;

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
};

module.exports = {
    generateUUID,
    isValidUUID,
};