const admin = require("firebase-admin");
const envConfig = require("@/config/env.config");

const loadServiceAccount = () => {
    // Ưu tiên env var (dùng trên Render: FIREBASE_SERVICE_ACCOUNT chứa toàn bộ JSON của service-account.json)
    if (envConfig.FIREBASE_SERVICE_ACCOUNT) {
        try {
            return JSON.parse(envConfig.FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
            console.error("[FIREBASE] FIREBASE_SERVICE_ACCOUNT không phải JSON hợp lệ:", error.message);
        }
    }

    // Fallback: file service-account.json (dùng khi chạy local, file này đã bị gitignore)
    try {
        return require("../../service-account.json");
    } catch {
        return null;
    }
};

const serviceAccount = loadServiceAccount();

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.cert(serviceAccount),
    });
    console.log("[FIREBASE] Đã khởi tạo Firebase Admin (FCM sẵn sàng)");
} else {
    console.warn(
        "[FIREBASE] Không tìm thấy service-account.json hoặc env FIREBASE_SERVICE_ACCOUNT — FCM push notification sẽ không hoạt động."
    );
}

module.exports = admin;
