const matchingService = require("@modules/matching/service/matching.service");

class DispatchService {
    constructor() {
        this.io = global.io;

        // SOS state in memory (MVP)
        // production → nên dùng Redis
        this.sosTracker = new Map();
        // { sosId: { round, timeout } }

        this.matchingService = matchingService
    }

    broadcastSOS = async (rescuers, sos) => {

        const sosId = sos.sosRequestId;

        this.sosTracker.set(sosId, {
            round: 1,
            startedAt: Date.now(),
            timeout: null
        });

        // Gửi đi tìm người cứu hộ
        this.#sendBatch(rescuers, sos);

        // Nếu chưa tìm thấy người nào cứu hộ hoặc chưa ai accept sẽ gửi lại
        this.#startRetryTimer(sos);
    }

    #sendBatch = (rescuers, sos) => {

        if (!rescuers || rescuers.length === 0) return;

        for (let i = 0; i < rescuers.length; i++) {

            const rescuer = rescuers[i];

            setTimeout(() => {

                this.io.to(rescuer.userId).emit("SOS_OFFER", {
                    sosId: sos.sosRequestId,
                    victimLat: sos.victimLat,
                    victimLng: sos.victimLng,
                    description: sos.description,
                    round: this.sosTracker.get(sos.sosRequestId)?.round
                });

            }, i * 2000); // stagger send
        }
    }

    #startRetryTimer = (sos) => {

        const sosId = sos.sosRequestId;

        const prevState = this.sosTracker.get(sosId);
        if (!prevState) return;

        // clear old timer nếu có
        if (prevState.timeout) {
            clearTimeout(prevState.timeout);
        }

        const timeout = setTimeout(async () => {

            const state = this.sosTracker.get(sosId);
            if (!state) return;

            // stop condition
            if (state.round >= 3) {
                this.sosTracker.delete(sosId);
                return;
            }

            // increase round
            state.round += 1;

            // get fresh matching mỗi round
            const newRescuers = await this.matchingService.findNearbyRescuersForSOS(sos);

            // resend
            this.#sendBatch(newRescuers, sos);

            // schedule next retry
            this.#startRetryTimer(sos);

        }, 30000); // 30s per round

        prevState.timeout = timeout;
    }

    stopSOS = (sosId) => {

        const state = this.sosTracker.get(sosId);

        if (state?.timeout) {
            clearTimeout(state.timeout);
        }

        this.sosTracker.delete(sosId);
    }

    pushNotification = async (userId, payload) => {
        // Firebase Cloud Messaging (FCM)
    }
}

module.exports = new DispatchService();