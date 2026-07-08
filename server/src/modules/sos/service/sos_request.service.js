const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const { hashLocation } = require("@/utils/geohash.util");
const userService = require("@modules/user/services/user.service");
const sosQueue = require("../../../queues/sos.queue");
const { transaction } = require("@/config/database.config");
const redis = require("../../../config/redis.config");

class SosRequestService {
    constructor() {
        this.sos_requestRepository = sos_requestRepository;
    }

    // nạn nhân tạo sos
    createSOS = async ({
        userId,
        phone,
        incidentTypeId,
        description,
        victimLat,
        victimLng,
    }) => {
        const sos = await transaction(async (client) => {
            const sosRequestId = uuidUtil.generateUUID();
            const geohash = hashLocation({ latitude: victimLat, longitude: victimLng });

            const sos = await this.sos_requestRepository.createSOS(client, {
                sosRequestId,
                userId,
                incidentTypeId,
                description,
                victimLat,
                victimLng,
                geohash,
            });

            if (phone) {
                await userService.updatePhone(client, {
                    userId,
                    phone,
                });
            }

            return sos;
        });

        await sosQueue.add(
            "process-sos",
            {
                sosId: sos.sos_request_id,
                attempt: 1,
            },
            {
                jobId: `process-sos-${sos.sos_request_id} attempt-1`,
                removeOnComplete: true,
                removeOnFail: true,
            }
        );

        const sosLocation = await redis.geoadd(
            "sos_locations",
            victimLng,
            victimLat,
            sos.sos_request_id
        );

        console.log("Sos location", sosLocation);

        return sos;
    };

    findSOSById = async (sosId) => {
        const sos = await this.sos_requestRepository.findSOSById(sosId);
        return sos;
    };
}

module.exports = new SosRequestService();
