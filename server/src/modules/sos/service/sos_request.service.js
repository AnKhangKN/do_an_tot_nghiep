const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const eventEmitter = require("@/events/eventEmitter");
const geohashUtil = require("@/utils/geohash.util");

class SosRequestService {
    constructor () {
        this.sos_requestRepository = sos_requestRepository
    }

    // nạn nhân tạo sos
    createSOS = async ({ userId, victimLat, victimLng, description }) => {
        const sosRequestId = uuidUtil.generateUUID();
        const geohash = geohashUtil({victimLat, victimLng});

        const sos = await this.sos_requestRepository.createSOS({sosRequestId, userId, victimLat, victimLng, geohash, description});

        eventEmitter.emit('sos:created', sos);

        return sos;
    }

    getSOS = async () => {}

    updateSOSStatus = async() => {}
}

module.exports = new SosRequestService()