const { pool } = require("@config/database.config");
const settingsModel = require("../model/settings.model");

const DEFAULT_SETTINGS = [
    { key: "search_radius_ladder", value: "2,5,10,20", label: "Dãy bán kính tìm kiếm (km, cách nhau dấu phẩy)", group: "dispatch", type: "string" },
    { key: "offer_accept_seconds", value: "30", label: "Thời gian chờ nhận offer (giây)", group: "dispatch", type: "number" },
    { key: "retry_interval_seconds", value: "15", label: "Thời gian lặp lại mở rộng bán kính (giây)", group: "dispatch", type: "number" },
    { key: "max_rescuers_per_attempt", value: "5", label: "Số cứu hộ viên tối đa mỗi lượt offer", group: "dispatch", type: "number" },
    { key: "rescuer_freshness_seconds", value: "300", label: "Ngưỡng \"mới online\" của cứu hộ viên (giây)", group: "dispatch", type: "number" },
    { key: "auto_cancel_inactive_minutes", value: "30", label: "Tự hủy SOS không tương tác (phút)", group: "automation", type: "number" },
    { key: "chat_close_grace_minutes", value: "15", label: "Đóng chat sau khi SOS kết thúc (phút)", group: "automation", type: "number" },
    { key: "ai_moderation_enabled", value: "true", label: "Bật kiểm duyệt nội dung bằng AI", group: "ai", type: "boolean" },
    { key: "hotline_medical", value: "115", label: "Hotline cấp cứu y tế", group: "hotline", type: "string" },
    { key: "hotline_fire", value: "114", label: "Hotline chữa cháy", group: "hotline", type: "string" },
    { key: "hotline_police", value: "113", label: "Hotline cảnh sát", group: "hotline", type: "string" },
    { key: "hotline_emergency", value: "112", label: "Số khẩn cấp quốc gia", group: "hotline", type: "string" },
];

class SettingsRepository {
    constructor() {
        this.settings = settingsModel;
        this.ensureTableStructure();
    }

    async ensureTableStructure() {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    setting_key VARCHAR(100) PRIMARY KEY,
                    setting_value TEXT,
                    label VARCHAR(255),
                    group_name VARCHAR(50),
                    data_type VARCHAR(20) DEFAULT 'string',
                    is_editable BOOLEAN DEFAULT TRUE,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            `);

            for (const setting of DEFAULT_SETTINGS) {
                await pool.query(
                    `INSERT INTO system_settings
                        (setting_key, setting_value, label, group_name, data_type)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (setting_key) DO NOTHING;`,
                    [setting.key, setting.value, setting.label, setting.group, setting.type]
                );
            }
        } catch (error) {
            console.error("[SettingsRepository] Ensure table structure error:", error.message);
        }
    }

    async getAll() {
        const query = `
            SELECT
                ${this.settings.field.settingKey},
                ${this.settings.field.settingValue},
                ${this.settings.field.label},
                ${this.settings.field.groupName},
                ${this.settings.field.dataType},
                ${this.settings.field.isEditable},
                ${this.settings.field.updatedAt}
            FROM ${this.settings.table}
            ORDER BY ${this.settings.field.groupName}, ${this.settings.field.settingKey}
        `;
        const result = await pool.query(query);
        return result.rows || [];
    }

    async updateValues(values) {
        for (const key of Object.keys(values)) {
            await pool.query(
                `UPDATE ${this.settings.table}
                 SET ${this.settings.field.settingValue} = $2,
                     ${this.settings.field.updatedAt} = CURRENT_TIMESTAMP
                 WHERE ${this.settings.field.settingKey} = $1;`,
                [key, String(values[key])]
            );
        }
    }
}

module.exports = new SettingsRepository();
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
