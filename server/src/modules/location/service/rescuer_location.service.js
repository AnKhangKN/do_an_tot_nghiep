const rescuer_locationRepository = require("../repository/rescuer_location.repository");
const { hashLocation } = require("@utils/geohash.util");

class RescuerLocationService {

    constructor () {
        this.rescuer_locationRepository = rescuer_locationRepository
    }

    // cập nhật vị trí realtime của rescuer
    updateLocation = async ({userId, lat, lng}) => {

        const geohash = await hashLocation({ lat, lng });
        console.log("Tạo geohash: ", geohash);

        return await this.rescuer_locationRepository.updateLocation({userId, lat, lng, geohash});
    }

    // lấy vị trí hiện tại của rescuer
    getCurrentLocation = async () => {

    }
}

module.exports = new RescuerLocationService();