const redis = require("@/config/redis.config");
const settingsRepository = require("@/modules/settings/repository/settings.repository");

const CACHE_KEY = "system_settings";
const CACHE_TTL_SECONDS = 3600;

const parseRadiusLadder = (value) => {
    if (!value) return [2, 5, 10, 20];
    const parts = String(value)
        .split(",")
        .map((v) => parseFloat(v.trim()))
        .filter((v) => Number.isFinite(v) && v > 0);
    return parts.length > 0 ? parts : [2, 5, 10, 20];
};

const getSettingsMap = async () => {
    try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (error) {
        console.error("[SettingsUtil] Đọc cache lỗi:", error.message);
    }

    try {
        const rows = await settingsRepository.getAll();
        const map = {};
        rows.forEach((row) => {
            map[row.setting_key] = row.setting_value;
        });
        await redis.set(CACHE_KEY, JSON.stringify(map), "EX", CACHE_TTL_SECONDS);
        return map;
    } catch (error) {
        console.error("[SettingsUtil] Đọc settings từ DB lỗi:", error.message);
        return {};
    }
};

const getSettingNumber = async (key, fallback) => {
    const map = await getSettingsMap();
    const raw = map[key];
    if (raw === undefined || raw === null || raw === "") return fallback;
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
};

const getSettingBoolean = async (key, fallback = false) => {
    const map = await getSettingsMap();
    const raw = map[key];
    if (raw === undefined || raw === null) return fallback;
    return String(raw).toLowerCase() === "true";
};

const invalidateSettingsCache = async () => {
    try {
        await redis.del(CACHE_KEY);
    } catch (error) {
        console.error("[SettingsUtil] Xóa cache lỗi:", error.message);
    }
};

module.exports = {
    getSettingsMap,
    getSettingNumber,
    getSettingBoolean,
    parseRadiusLadder,
    invalidateSettingsCache,
};
