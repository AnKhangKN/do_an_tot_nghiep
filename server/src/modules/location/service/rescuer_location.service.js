const rescuer_locationRepository = require("../repository/rescuer_location.repository")

class RescuerLocationService {

    constructor () {
        this.rescuer_locationRepository = rescuer_locationRepository
    }

    // cập nhật vị trí realtime của rescuer
    updateLocation = async (client ,{userId, lat, lng}) => {
        return await this.rescuer_locationRepository.updateLocation(client, {userId, lat, lng});
    }

    // lấy vị trí hiện tại của rescuer
    getCurrentLocation = async () => {

    }
}

module.exports = new RescuerLocationService();