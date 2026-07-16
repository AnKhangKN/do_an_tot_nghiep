const rescuerService = require('@modules/rescuer/service/rescuer.service');

class MatchingService {

    constructor() {
        this.rescuerService = rescuerService;
    }

    /**
     * MAIN: find suitable rescuers for SOS
     */
    findNearbyRescuersForSOS = async (sos, radius) => {

        // 1. Lấy từ redis (geo search) {#7a0,10}
        const nearbyRescuers =
            await this.rescuerService.findNearbyRescuers({
                lat: sos.victim_lat,
                lng: sos.victim_lng,
                radius
            });

        if (!nearbyRescuers || nearbyRescuers.length === 0) {
            return [];
        }

        // 2. NORMALIZE redis result
        const nearby = nearbyRescuers.map(([userId, distance]) => ({
            userId,
            distance: parseFloat(distance)
        }));

        const rescuerIds = nearby.map(r => r.userId);

        // 3. Lấy từ DB {#7a0,6}
        const rescuers =
            await this.rescuerService.getRescuersByIds(rescuerIds);

        if (!rescuers || rescuers.length === 0) {
            return [];
        }

        // 4. MAP DB by user_id
        const dbMap = new Map(
            rescuers.map(r => [r.user_id, r])
        );

        // 5. MERGE Redis + DB
        const merged = nearby
            .map(r => {
                const db = dbMap.get(r.userId);

                if (!db) return null;

                return {
                    userId: r.userId,
                    distance: r.distance,
                    status: db.status,
                    lastSeenAt: db.last_seen_at
                };
            })
            .filter(Boolean);

        // 6. FILTER AVAILABLE
        const available = await this.#filterAvailability(merged);

        if (!available.length) {
            return [];
        }

        // 7. SORT BY DISTANCE (closest first)
        available.sort((a, b) => a.distance - b.distance);

        // 8. RETURN TOP 5
        return available.slice(0, 5);
    }

    /**
     * FILTER: only active + recently online rescuers
     */
    #filterAvailability = async (rescuers) => {

        const NOW_LIMIT_SECONDS = 300; // Tăng từ 30s lên 300s (5 phút) để phù hợp với độ trễ di động chạy nền
        const now = Date.now();

        return rescuers.filter(r => {

            // must be active
            if (r.status !== "ACTIVE") return false;

            // must have lastSeen
            if (!r.lastSeenAt) return false;

            const lastSeen = new Date(r.lastSeenAt).getTime();
            const diffSeconds = (now - lastSeen) / 1000;

            // must be recently online
            return diffSeconds <= NOW_LIMIT_SECONDS;
        });
    }
}

module.exports = new MatchingService();