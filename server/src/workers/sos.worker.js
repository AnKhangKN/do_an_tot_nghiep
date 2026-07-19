require("module-alias/register");
require("@events");

const { Worker } = require("bullmq");

const sosQueue = require("../queues/sos.queue");
const sosRequestService = require("../modules/sos/service/sos_request.service");
const matchingService = require("../modules/matching/service/matching.service");
const dispatchService = require("../modules/dispatch/service/dispatcher.service");
const connection = require("../config/redis.config");
const redis = require("../config/redis.config");

const radiusList = [2, 5, 10, 20];

const worker = new Worker(
    "sos",
    async (job) => {
        const { sosId, attempt } = job.data;

        if (job.name === "process-sos") {
            const sos = await sosRequestService.findSOSById(sosId);

            if (!sos) {
                console.log(`[SOS] Not found: ${sosId}`);
                return;
            }

            // Kiểm tra trạng thái SOS
            if (sos.status !== "PENDING" && sos.status !== "SEARCHING") {
                console.log(`[SOS] Bỏ qua process-sos do SOS ${sosId} đã có trạng thái ${sos.status}`);
                return;
            }

            // Lưu attempt hiện tại vào Redis
            await redis.set(`sos:${sosId}:attempt`, attempt, "EX", 3600);

            const radius = radiusList[attempt - 1];

            console.log(
                `[SOS] Search radius: ${radius} km (Attempt ${attempt})`
            );

            const rescuers =
                await matchingService.findNearbyRescuersForSOS(
                    sos,
                    radius
                );

            // Nếu có rescuer phù hợp sẽ gửi offer
            if (rescuers.length > 0) {
                await dispatchService.broadcastSOS(rescuers, sos);

                console.log(
                    `[SOS] Dispatched SOS ${sosId} to ${rescuers.length} rescuers`
                );

                // Thêm job kiểm tra timeout sau 30 giây
                await sosQueue.add(
                    "check-offer-timeout",
                    {
                        sosId,
                        attempt,
                    },
                    {
                        jobId: `check-offer-timeout-${sosId}-attempt-${attempt}`,
                        delay: 30000,
                        removeOnComplete: true,
                        removeOnFail: true,
                    }
                );

                return;
            }

            // Gửi tiếp nếu không tìm thấy người cứu hộ trong bán kính hiện tại
            if (attempt < radiusList.length) {
                console.log(
                    `[SOS] Retry after 15s with radius ${radiusList[attempt]} km`
                );

                await sosQueue.add( 
                    "process-sos",
                    {
                        sosId,
                        attempt: attempt + 1,
                    },
                    {
                        jobId: `process-sos-${sosId} attempt-${attempt + 1}`,
                        removeOnComplete: true,
                        removeOnFail: true,
                        delay: 15000,
                    }
                );
            } else {
                console.log(
                    `[SOS] No rescuer found after all attempts`
                );

                // Cập nhật trạng thái SOS thành CANCELLED trong database trước tiên để kiểm tra race condition
                const updatedSos = await sosRequestService.cancelSOS({
                    sosRequestId: sosId,
                    cancelReason: "Không tìm thấy người cứu hộ trong phạm vi"
                });

                if (updatedSos) {
                    // Thông báo về nạn nhân rằng không tìm được rescuer qua pubsub
                    const payload = JSON.stringify({
                        sosId,
                        victimId: updatedSos.user_id,
                    });
                    await redis.publish("sos:not_found", payload);

                    // Đồng thời gửi Push Notification báo thất bại cho nạn nhân
                    const notificationService = require("@modules/notification/service/notification.service");
                    await notificationService.sendPushNotification(updatedSos.user_id, {
                        title: "Không tìm thấy người cứu hộ",
                        body: "Chưa tìm thấy người cứu hộ phù hợp cho yêu cầu trợ giúp của bạn. Vui lòng thử lại sau.",
                        data: {
                            type: "SOS_NOT_FOUND",
                            sosRequestId: sosId
                        }
                    }).catch(err => console.error("Lỗi gửi push notification cho victim:", err));

                    // Dọn dẹp Redis
                    await sosRequestService.cleanupSosKeys(sosId);
                } else {
                    console.log(`[SOS] Bỏ qua gửi sos:not_found do SOS ${sosId} đã được nhận hoặc hủy trước đó`);
                }
            }
        } else if (job.name === "check-offer-timeout") {
            console.log(`[SOS] Executing check-offer-timeout for SOS ${sosId} (Attempt ${attempt})`);
            await sosRequestService.handleOfferTimeout({ sosRequestId: sosId, attempt });
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