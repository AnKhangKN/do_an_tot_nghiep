const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const eventEmitter = require("@/events/eventEmitter");

class SosRequestService {
    constructor () {
        this.sos_requestRepository = sos_requestRepository
    }

    createSOS = async ({ userId, victimLat, victimLng, description }) => {
        const sosRequestId = uuidUtil.generateUUID();

        console.log(sosRequestId);

        const sos = await this.sos_requestRepository.createSOS({sosRequestId, userId, victimLat, victimLng, description});

        // Gửi event
        eventEmitter.emit("SOS_CREATED", sos);

        return sos;
    }

    getSOS = async () => {}

    updateSOSStatus = async() => {}
}

module.exports = new SosRequestService()