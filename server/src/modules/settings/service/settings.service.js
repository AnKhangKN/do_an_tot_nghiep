const settingsRepository = require("../repository/settings.repository");
const { invalidateSettingsCache } = require("@/utils/settings.util");

const GROUP_LABELS = {
    dispatch: "Điều phối & ghép cứu hộ",
    automation: "Tự động hóa SOS",
    ai: "Trí tuệ nhân tạo (AI)",
    hotline: "Hotline khẩn cấp",
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
        return {
            groups: GROUP_LABELS,
            settings: rows.map((row) => ({
                key: row.setting_key,
                value: row.setting_value,
                label: row.label,
                group: row.group_name,
                type: row.data_type,
                editable: row.is_editable,
                updatedAt: row.updated_at,
            })),
        };
    };

    update = async (updates) => {
        await settingsRepository.updateValues(updates);
        await invalidateSettingsCache();
        return await this.getAllAdmin();
    };
}

module.exports = new SettingsService();
