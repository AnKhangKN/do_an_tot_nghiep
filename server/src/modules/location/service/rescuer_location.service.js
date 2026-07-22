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

        await redis.set(`active:rescuer:${userId}`, '1', 'EX', 300);
        await redis.hset("rescuer:last_seen", userId, new Date().toISOString());
    };
}

module.exports = new RescuerLocationService();