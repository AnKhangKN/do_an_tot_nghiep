const rescuerService = require('@modules/rescuer/service/rescuer.service');

class MatchingService {

    constructor(
    ) {
        this.rescuerService = rescuerService;
    }

    findNearbyRescuersForSOS = async (sos, radius) => {

        // 1. tìm tất cả rescuer trong bán kính
        const nearbyRescuers =
            await this.rescuerService.findNearbyRescuers({
                lat: sos.victimLat,
                lng: sos.victimLng,
                radius
            });

        // 2. lọc khả dụng
        const availableRescuers =
            await this.#filterAvailability({
                rescuers: nearbyRescuers,
                sos
            });

        // 3. rank
        const ranked =
            await this.#rankRescuers(
                availableRescuers,
                sos
            );

        return ranked.slice(0, 5);
    }

    #filterAvailability = async ({ rescuers }) => {

        const NOW_LIMIT = 30;
        const now = Date.now();

        return rescuers.filter(r => {

            if (!r.isOnline) {
                return false;
            }

            if (r.status !== 'ACTIVE') {
                return false;
            }

            const lastSeen =
                new Date(r.lastLocationUpdatedAt).getTime();

            const diffSeconds =
                (now - lastSeen) / 1000;

            if (diffSeconds > NOW_LIMIT) {
                return false;
            }

            return true;
        });
    }

    #rankRescuers = async (rescuers, sos) => {

        return rescuers.sort((a, b) => {

            const distanceA =
                this.#calculateDistance(
                    sos.victimLat,
                    sos.victimLng,
                    a.lat,
                    a.lng
                );

            const distanceB =
                this.#calculateDistance(
                    sos.victimLat,
                    sos.victimLng,
                    b.lat,
                    b.lng
                );

            return distanceA - distanceB;
        });
    }

    #calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;

        const dLat =
            (lat2 - lat1) * Math.PI / 180;

        const dLon =
            (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
    }
}

module.exports = new MatchingService();