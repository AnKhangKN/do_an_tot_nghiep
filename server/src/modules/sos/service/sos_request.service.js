const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const geohashUtil = require("@/utils/geohash.util");
const userService = require("@modules/user/services/user.service")


class SosRequestService {
    constructor() {
        this.sos_requestRepository = sos_requestRepository
    }

    // nạn nhân tạo sos
    createSOS = async (client, { userId, phone, incidentTypeId, description, victimLat, victimLng }) => {
        const sosRequestId = uuidUtil.generateUUID();
        const geohash = geohashUtil({ victimLat, victimLng });

        const sos = await this.sos_requestRepository.createSOS(client, { sosRequestId, userId, incidentTypeId, description, victimLat, victimLng, geohash });

        await userService.updatePhone(client, { userId, phone });

        await sosQueue.add('process-sos', {
            sosId: sosRequestId,
            attempt: 1
        });

        return sos;
    }

    findSOSById = async (sosId) => {
        const sos = await this.sos_requestRepository.findSOSById(sosId);
        return sos;
    }
}

module.exports = new SosRequestService()