require("module-alias/register");
require("@events");

const { Worker } = require("bullmq");

const sosQueue = require("../queues/sos.queue");
const sosRequestService = require("../modules/sos/service/sos_request.service");
const matchingService = require("../modules/matching/service/matching.service");
const dispatchService = require("../modules/dispatch/service/dispatcher.service");
const connection = require("../config/redis.config");

const radiusList = [2, 5, 10, 20];

const worker = new Worker(
    "sos",
    async (job) => {
        const { sosId, attempt } = job.data;

        const sos = await sosRequestService.findSOSById(sosId);

        if (!sos) {
            console.log(`[SOS] Not found: ${sosId}`);
            return;
        }

        const radius = radiusList[attempt - 1];

        console.log(
            `[SOS] Search radius: ${radius} km`
        );

        const rescuers =
            await matchingService.findNearbyRescuersForSOS(
                sos,
                radius
            );

        // Nếu có rescuer phù hợp sẽ gửi sendSOS {#99ff99,9}
        if (rescuers.length > 0) {
            await dispatchService.broadcastSOS(rescuers, sos);

            console.log(
                `[SOS] Dispatched SOS ${sosId}`
            );

            return;
        }

        // Gửi tiếp nếu không tìm thấy người cứu hộ trong bán kính hiện tại {#95e,25}
        if (attempt < radiusList.length) {
            console.log(
                `[SOS] Retry after 15s with radius ${radiusList[attempt]
                } km`
            );

            await sosQueue.add( 
                "process-sos",
                {
                    sosId,
                    attempt: attempt + 1,
                },
                {

                    jobId: `process-sos-${sos.sos_request_id} attempt-${attempt + 1}`,
                    removeOnComplete: true,
                    removeOnFail: true,
                    delay: 15000,
                }
            );
        } else {
            console.log(
                `[SOS] No rescuer found after all attempts`
            );
        }
    },
    {
        connection,
    }
);

worker.on("completed", (job) => {
    console.log(
        `[SOS] Job ${job.id} completed`
    );
});

worker.on("failed", (job, err) => {
    console.error(
        `[SOS] Job ${job?.id} failed`,
        err
    );
});

module.exports = worker;