const throwError = require("@/utils/throw_error.util");
const aiModerationService = require("@/modules/ai_moderation/service/ai_moderation.service");

const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const VIETNAM_BBOX = "102,8,110,24";
const SEARCH_TIMEOUT_MS = 8000;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const searchHits = new Map();

const removeVietnameseTones = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const isRateLimited = (key) => {
    const now = Date.now();
    const timestamps = (searchHits.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (timestamps.length >= RATE_LIMIT_MAX) {
        return true;
    }

    timestamps.push(now);
    searchHits.set(key, timestamps);
    return false;
};

const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
};

const searchPhoton = async (query, limit) => {
    const keyword = encodeURIComponent(removeVietnameseTones(query) + " Vietnam");
    const url = `${PHOTON_URL}?q=${keyword}&limit=${limit}&bbox=${VIETNAM_BBOX}`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": "rescue-app" } });
    if (!res.ok) throw new Error(`Photon lỗi: HTTP ${res.status}`);

    const data = await res.json();
    return (data.features || [])
        .filter((item) => item.properties.countrycode === "VN")
        .map((item) => {
            const [lng, lat] = item.geometry.coordinates;
            const p = item.properties || {};
            return {
                name: p.name || "Không tên",
                city: p.city || "",
                state: p.state || "",
                country: p.country || "Việt Nam",
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            };
        });
};

const searchNominatim = async (query, limit) => {
    const keyword = encodeURIComponent(query + " Việt Nam");
    const url = `${NOMINATIM_URL}?format=json&q=${keyword}&limit=${limit}&countrycodes=vn`;

    const res = await fetchWithTimeout(url, { headers: { "User-Agent": "rescue-app" } });
    if (!res.ok) throw new Error(`Nominatim lỗi: HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
        name: item.display_name || "Không tên",
        city: item.address?.city || item.address?.town || "",
        state: item.address?.state || "",
        country: item.address?.country || "Việt Nam",
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
    }));
};

class MapService {
    /**
     * Tìm kiếm địa điểm qua proxy server để kiểm soát nội dung & tần suất truy vấn
     */
    async searchLocations({ query, limit, userId }) {
        // 1. Chặn từ khóa chứa cụm từ nhạy cảm (blacklist nội bộ, 0 token AI)
        const moderation = await aiModerationService.checkKnownSpamText(query);
        if (moderation && moderation.isBlocked) {
            throwError(moderation.reason || "Từ khóa tìm kiếm không hợp lệ!", 400);
        }

        // 2. Giới hạn tần suất tìm kiếm chống abuse
        if (isRateLimited(`user:${userId}`)) {
            throwError("Bạn đang tìm kiếm quá nhanh. Vui lòng thử lại sau một phút!", 429);
        }

        // 3. Gọi Photon trước, fallback Nominatim
        let results = [];
        try {
            results = await searchPhoton(query, limit);
        } catch (photonErr) {
            console.error("[MapService] Photon lỗi, chuyển sang Nominatim:", photonErr.message);
        }

        if (results.length === 0) {
            try {
                results = await searchNominatim(query, limit);
            } catch (nominatimErr) {
                console.error("[MapService] Nominatim lỗi:", nominatimErr.message);
            }
        }

        return results;
    }
}

module.exports = new MapService();
