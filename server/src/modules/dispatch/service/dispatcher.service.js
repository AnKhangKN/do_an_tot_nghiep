const redis = require("../../../config/redis.config");

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

        // Xóa tập hợp offered cũ nếu có
        pipeline.del(`sos:${sosId}:offered_rescuers`);

        for (let i = 0; i < rescuers.length; i++) {
            const rescuer = rescuers[i];

            // Đánh dấu cứu hộ viên đang bận xem xét SOS offer này trong 30 giây
            pipeline.set(`sos:offer:rescuer:${rescuer.userId}`, sosId, "EX", 30);

            // Lưu cứu hộ viên vào Redis Set offered_rescuers
            pipeline.sadd(`sos:${sosId}:offered_rescuers`, rescuer.userId);

            try {
                const payload = {
                    rescuerId: rescuer.userId,
                    sosId,
                    victimLat: sos.victim_lat,
                    victimLng: sos.victim_lng,
                    description: sos.description,
                    incidentTypeName: sos.incident_type_name
                };

                pipeline.publish("sos:offer", JSON.stringify(payload));
            } catch (err) {
                console.error("PUBLISH ERROR", err);
            }
        }

        // Tự động dọn dẹp key này sau 120 giây đề phòng job timeout không chạy
        pipeline.expire(`sos:${sosId}:offered_rescuers`, 120);

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