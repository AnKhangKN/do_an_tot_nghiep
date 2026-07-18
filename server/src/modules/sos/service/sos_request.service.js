const uuidUtil = require("@/utils/uuid.util");
const sos_requestRepository = require("../repository/sos_request.repository");
const { hashLocation } = require("@/utils/geohash.util");
const userService = require("@modules/user/services/user.service");
const sosQueue = require("../../../queues/sos.queue");
const { transaction } = require("@/config/database.config");
const redis = require("../../../config/redis.config");
const dispatchService = require("@modules/dispatch/service/dispatcher.service");

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

    acceptSOS = async ({ sosRequestId, rescuerId }) => {
        const updatedSos = await transaction(async (client) => {
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos) {
                throw new Error("Không tìm thấy yêu cầu cứu hộ!");
            }
            if (sos.status !== "PENDING" && sos.status !== "SEARCHING") {
                throw new Error("Yêu cầu cứu hộ đã được tiếp nhận hoặc đã bị hủy!");
            }

            const now = new Date();
            const updated = await this.sos_requestRepository.updateRescuerAndStatus(client, {
                sosRequestId,
                rescuerId,
                status: "IN_PROGRESS",
                acceptedAt: now
            });

            return updated;
        });

        // Xóa SOS location khỏi Redis Geo
        await redis.zrem("sos_locations", sosRequestId);

        // Ngắt luồng tìm kiếm (bullmq)
        dispatchService.stopSOS(sosRequestId);

        return updatedSos;
    };

    completeSOS = async ({ sosRequestId }) => {
        return await transaction(async (client) => {
            const sos = await this.sos_requestRepository.findSOSById(sosRequestId);
            if (!sos) {
                throw new Error("Không tìm thấy yêu cầu cứu hộ!");
            }
            if (sos.status !== "IN_PROGRESS") {
                throw new Error("Yêu cầu cứu hộ không ở trạng thái đang thực hiện!");
            }

            const now = new Date();
            const updated = await this.sos_requestRepository.completeSOS(client, {
                sosRequestId,
                completedAt: now
            });

            return updated;
        });
    };
}

module.exports = new SosRequestService();
