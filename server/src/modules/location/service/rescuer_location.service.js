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

        // Debug: Lấy vị trí của rescuer từ redis để kiểm tra
        const pos = await redis.geopos(
            'rescuer_locations',
            userId
        );

        console.log(pos);

    };
}

module.exports = new RescuerLocationService();