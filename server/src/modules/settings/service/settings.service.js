const settingsRepository = require("../repository/settings.repository");
const aiModerationRepository = require("@/modules/ai_moderation/repository/ai_moderation.repository");
const { invalidateSettingsCache } = require("@/utils/settings.util");

const GROUP_LABELS = {
    dispatch: "Điều phối & Ca SOS",
    automation: "Tự động hóa & Khóa kênh",
    geofence: "Cảnh báo Rủi ro & Geofencing",
    ai: "Trí tuệ Nhân tạo (AI)",
    hotline: "Hotline Khẩn cấp & Hệ thống",
};

class SettingsService {
    init = async () => {
        // Đảm bảo bảng + seed (repository constructor đã tạo bảng); làm nóng cache
        try {
            await settingsRepository.getAll();
        } catch (error) {
            console.error("[SettingsService] Init settings error:", error.message);
        }
    };

    getAllAdmin = async () => {
        const rows = await settingsRepository.getAll();

        // Đọc danh sách từ cấm thực tế từ bảng CSDL blacklisted_phrases
        let blacklistedPhrasesStr = "";
        try {
            const phrasesRows = await aiModerationRepository.getAllBlacklistedPhrases();
            if (Array.isArray(phrasesRows) && phrasesRows.length > 0) {
                blacklistedPhrasesStr = phrasesRows.map((r) => r.phrase).filter(Boolean).join(", ");
            }
        } catch (err) {
            console.error("[SettingsService] Lỗi đọc blacklisted_phrases:", err.message);
        }

        return {
            groups: GROUP_LABELS,
            settings: rows.map((row) => {
                let val = row.setting_value;
                if (row.setting_key === "blacklisted_phrases_list") {
                    val = blacklistedPhrasesStr;
                }
                return {
                    key: row.setting_key,
                    value: val,
                    label: row.label,
                    group: row.group_name,
                    type: row.data_type,
                    editable: row.is_editable,
                    updatedAt: row.updated_at,
                };
            }),
        };
    };

    update = async (updates) => {
        // Nếu Admin nhập danh sách từ cấm nhạy cảm mới, lưu trực tiếp vào bảng blacklisted_phrases
        if (updates && updates.blacklisted_phrases_list !== undefined) {
            const rawPhrases = String(updates.blacklisted_phrases_list)
                .split(",")
                .map((p) => p.trim())
                .filter((p) => p.length > 0);

            if (rawPhrases.length > 0) {
                await aiModerationRepository.addBlacklistedPhrases(rawPhrases, "MANUAL_ADMIN");
            }
        }

        await settingsRepository.updateValues(updates);
        await invalidateSettingsCache();
        return await this.getAllAdmin();
    };
}

module.exports = new SettingsService();
