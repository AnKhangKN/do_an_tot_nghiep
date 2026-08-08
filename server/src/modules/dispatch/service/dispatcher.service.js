const redis = require("../../../config/redis.config");
const settingsUtil = require("../../../utils/settings.util");

class DispatchService {
    constructor() {
        // SOS state: stop flag
        this.activeSOS = new Map();
        // { sosId: { stopped: false } }
    }

    broadcastSOS = async (rescuers, sos) => {

        if (!rescuers?.length) return;

        const sosId = sos.sos_request_id;
        const pipeline = redis.pipeline();
        const offerAcceptSeconds = await settingsUtil.getSettingNumber("offer_accept_seconds", 30);

        // Xóa tập hợp offered cũ nếu có
        pipeline.del(`sos:${sosId}:offered_rescuers`);

        for (let i = 0; i < rescuers.length; i++) {
            const rescuer = rescuers[i];

            // Đánh dấu cứu hộ viên đang bận xem xét SOS offer này trong offerAcceptSeconds giây
            pipeline.set(`sos:offer:rescuer:${rescuer.userId}`, sosId, "EX", offerAcceptSeconds);

            // Lưu cứu hộ viên vào Redis Set offered_rescuers
            pipeline.sadd(`sos:${sosId}:offered_rescuers`, rescuer.userId);

            try {
                const payload = {
                    rescuerId: rescuer.userId,
                    sosId,
                    victimLat: sos.victim_lat,
                    victimLng: sos.victim_lng,
                    description: sos.description,
                    incidentTypeName: sos.incident_type_name,
                    imageUrl: sos.image_url || sos.imageUrl || null,
                    image_url: sos.image_url || sos.imageUrl || null
                };

                pipeline.publish("sos:offer", JSON.stringify(payload));
            } catch (err) {
                console.error("PUBLISH ERROR", err);
            }
        }

        // Tự động dọn dẹp key này sau thời gian chờ nhận offer để tránh key bị giữ lâu
        pipeline.expire(`sos:${sosId}:offered_rescuers`, offerAcceptSeconds);

        await pipeline.exec();
    }

    /**
     * CALL THIS WHEN RESCUER ACCEPT SOS
     */
    stopSOS = (sosId) => {
        const state = this.activeSOS.get(sosId);

        if (state) {
            state.stopped = true;
        }

        console.log(`[DISPATCH] STOP SOS ${sosId}`);
    }

    pushNotification = async (userId, payload) => { }
}

module.exports = new DispatchService();