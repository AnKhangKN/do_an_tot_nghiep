const redis = require("../../../config/redis.config");
const rescuerRepository = require("@modules/rescuer/repository/rescuer.repository");

class RescuerLocationService {

    // Cập nhật vị trí của rescuer vào redis để tìm kiếm nhanh
    updateLocation = async ({
        userId,
        lat,
        lng
    }) => {
        // 1. Kiểm tra trạng thái Online từ Redis cache trước
        let status = await redis.get(`rescuer:status:${userId}`);

        // Nếu cache chưa có (do vừa restart server hoặc cache hết hạn), tra cứu từ DB
        if (!status) {
            const isOnline = await rescuerRepository.checkRescuerOnline({ userId }).catch(() => false);
            status = isOnline ? 'ACTIVE' : 'OFFLINE';
            await redis.set(`rescuer:status:${userId}`, status);
        }

        // 2. Nếu Cứu hộ viên đang OFFLINE: không cập nhật vào Geo Search & xóa các key kích hoạt
        if (status !== 'ACTIVE') {
            await redis.zrem('rescuer_locations', userId);
            await redis.del(`active:rescuer:${userId}`);
            return;
        }

        // 3. Nếu Cứu hộ viên đang ACTIVE: cập nhật vị trí vào Redis Geo và gia hạn TTL
        await redis.geoadd(
            'rescuer_locations',
            lng,
            lat,
            userId
        );

        await redis.set(`active:rescuer:${userId}`, '1', 'EX', 300);
        await redis.hset("rescuer:last_seen", userId, new Date().toISOString());
    };
}

module.exports = new RescuerLocationService();