class MatchingService {

    constructor() {}

    findNearbyRescuersForSOS = async (sos) => {
        const rescuers = await this.#filterAvailability();
        const ranked = await this.#rankRescuers(rescuers, sos);
        return ranked.slice(0, 5);
    }

    // Kiểm tra có ở gần không, nếu có thì status active không, nếu có thì last seen dưới 30s không
    #filterAvailability = async ({rescuers, sos}) => {
        const NOW_LIMIT = 30; 

        
        return rescuers.filter(r => {
            
        });
    }

    // Lọc 5 người tốt nhất
    #rankRescuers = async (rescuers, sos) => {
        return rescuers;
    }
}

module.exports = new MatchingService();