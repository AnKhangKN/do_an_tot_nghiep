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

        for (let i = 0; i < rescuers.length; i++) {

            const rescuer = rescuers[i];

                try {

                    const payload = {
                        rescuerId: rescuer.userId,
                        sosId,
                        victimLat: sos.victim_lat,
                        victimLng: sos.victim_lng,
                        description: sos.description
                    };

                    const count = await redis.publish(
                        "sos:offer",
                        JSON.stringify(payload)
                    );

                    console.log("PUBLISH COUNT =", count);

                } catch (err) {
                    console.error("PUBLISH ERROR", err);
                }
        }
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