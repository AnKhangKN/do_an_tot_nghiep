require("module-alias/register");
require("@events");

const { Worker } = require("bullmq");
const sosQueue = require("../queues/sos.queue");
const sosRequestService = require("../modules/sos/service/sos_request.service");
const matchingService = require("../modules/matching/service/matching.service");
const dispatchService = require("../modules/dispatch/service/dispatcher.service");
const connection = require("../config/redis.config");

const worker = new Worker(
    "sos",
    async (job) => {
        const { sosId, attempt } = job.data;

        // Lấy thông tin SOS từ cơ sở dữ liệu
        const sos = await sosRequestService.findSOSById(sosId);

        // Nếu không tìm thấy SOS, dừng xử lý
        if (!sos) {
            return;
        }
        const radiusList = [2, 5, 10, 20];

        // Lấy bán kính dựa trên số lần thử
        const radius = radiusList[attempt - 1];

        // Tìm các rescuer gần nạn nhân trong bán kính
        const rescuers = await matchingService.findNearbyRescuersForSOS(
            sos,
            radius,
        );

        if (rescuers.length > 0) {
            await dispatchService.sendSOS(rescuers, sos);

            return;
        }

        if (attempt < 4) {
            await sosQueue.add(
                "process-sos",
                {
                    sosId,
                    attempt: attempt + 1,
                },
                {
                    delay: 15000,
                },
            );
        }
    },
    { connection },
);

module.exports = worker;
