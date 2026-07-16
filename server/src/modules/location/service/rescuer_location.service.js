const redis = require("../../../config/redis.config");

class RescuerLocationService {


    // Cập nhật vị trí của rescuer vào redis để tìm kiếm nhanh
    updateLocation = async ({
        userId,
        lat,
        lng
    }) => {

        await redis.geoadd(
            'rescuer_locations',
            lng,
            lat,
            userId
        );

        // Thiết lập key phụ hoạt động có thời hạn (TTL) 5 phút để dọn dẹp rác khi mất mạng
        await redis.set(`active:rescuer:${userId}`, '1', 'EX', 300);
        console.log(`[REDIS] Cập nhật active key cho user ${userId} với TTL 5 phút.`);
    };
}

module.exports = new RescuerLocationService();