const { pool } = require("@config/database.config");
const settingsModel = require("../model/settings.model");

const DEFAULT_SETTINGS = [
    { key: "search_radius_ladder", value: "2,5,10,20", label: "Dãy bán kính tìm kiếm Cứu hộ viên (km)", group: "dispatch", type: "string" },
    { key: "offer_accept_seconds", value: "30", label: "Thời gian chờ Cứu hộ viên nhận offer (giây)", group: "dispatch", type: "number" },
    { key: "retry_interval_seconds", value: "15", label: "Thời gian lặp lại mở rộng bán kính (giây)", group: "dispatch", type: "number" },
    { key: "max_rescuers_per_attempt", value: "5", label: "Số cứu hộ viên tối đa mỗi lượt offer", group: "dispatch", type: "number" },
    { key: "rescuer_freshness_seconds", value: "300", label: "Ngưỡng \"mới online\" của cứu hộ viên (giây)", group: "dispatch", type: "number" },

    { key: "auto_cancel_inactive_minutes", value: "30", label: "Tự hủy SOS không tương tác (phút)", group: "automation", type: "number" },
    { key: "chat_close_grace_minutes", value: "15", label: "Gia hạn mở chat sau khi SOS kết thúc (phút)", group: "automation", type: "number" },

    { key: "geofence_high_radius", value: "500", label: "Bán kính cảnh báo Geofencing cấp Cao (mét)", group: "geofence", type: "number" },
    { key: "geofence_medium_radius", value: "350", label: "Bán kính cảnh báo Geofencing cấp Trung bình (mét)", group: "geofence", type: "number" },
    { key: "geofence_low_radius", value: "200", label: "Bán kính cảnh báo Geofencing cấp Thấp (mét)", group: "geofence", type: "number" },
    { key: "cluster_sos_threshold", value: "3", label: "Ngưỡng số ca SOS tối thiểu để tự gom cụm điểm nóng", group: "geofence", type: "number" },
    { key: "cluster_sos_radius", value: "200", label: "Bán kính quét gom cụm điểm nóng tai nạn (mét)", group: "geofence", type: "number" },

    { key: "ai_moderation_enabled", value: "true", label: "Bật kiểm duyệt nội dung bằng AI (Groq Cloud)", group: "ai", type: "boolean" },
    { key: "ai_sentiment_enabled", value: "true", label: "Bật phân tích cảm xúc đánh giá bằng AI", group: "ai", type: "boolean" },
    { key: "blacklisted_phrases_list", value: "", label: "Từ điển từ cấm nhạy cảm local (cách nhau bởi dấu phẩy)", group: "ai", type: "string" },

    { key: "hotline_medical", value: "115", label: "Hotline cấp cứu y tế", group: "hotline", type: "string" },
    { key: "hotline_fire", value: "114", label: "Hotline chữa cháy", group: "hotline", type: "string" },
    { key: "hotline_police", value: "113", label: "Hotline cảnh sát", group: "hotline", type: "string" },
    { key: "hotline_emergency", value: "112", label: "Số khẩn cấp quốc gia", group: "hotline", type: "string" },
    { key: "hotlines_custom_list", value: "[]", label: "Danh sách Hotline bổ sung / địa phương (JSON)", group: "hotline", type: "string" },

    { key: "thesis_author_name", value: "", label: "Tên sinh viên thực hiện", group: "thesis", type: "string" },
    { key: "thesis_student_id", value: "", label: "Mã số sinh viên", group: "thesis", type: "string" },
    { key: "thesis_class", value: "", label: "Lớp", group: "thesis", type: "string" },
    { key: "thesis_school", value: "", label: "Trường", group: "thesis", type: "string" },
    { key: "thesis_supervisor", value: "", label: "Giảng viên hướng dẫn", group: "thesis", type: "string" },
    { key: "thesis_github_url", value: "", label: "Link Source code (GitHub)", group: "thesis", type: "string" },
    { key: "thesis_report_url", value: "", label: "Link Báo cáo PDF", group: "thesis", type: "string" },
    { key: "thesis_contact_email", value: "", label: "Email liên hệ", group: "thesis", type: "string" },
    { key: "thesis_contact_phone", value: "", label: "Số điện thoại liên hệ", group: "thesis", type: "string" },
    { key: "app_apk_url", value: "", label: "Link tải App (APK)", group: "thesis", type: "string" },

    { key: "terms_of_service_content", value: "1. Quyền và Trách nhiệm Người dùng:\n- Người dùng chịu trách nhiệm về tính chính xác của các tín hiệu SOS phát ra.\n- Nghiêm cấm hành vi phát tín hiệu SOS giả hoặc tạo điểm cảnh báo giả làm sai lệch dữ liệu cứu hộ.\n\n2. Quyền riêng tư & Vị trí:\n- Ứng dụng thu thập dữ liệu vị trí GPS khi bạn kích hoạt tín hiệu SOS hoặc chế độ cứu hộ ngầm nhằm mục đích chỉ đường cho Đội cứu hộ.\n- Dữ liệu vị trí được bảo mật tuyệt đối và chỉ chia sẻ cho Cứu hộ viên trong thời gian xử lý sự cố.\n\n3. Giới hạn trách nhiệm:\n- Hệ thống hỗ trợ tối đa việc kết nối cứu hộ thời gian thực nhưng không thay thế hoàn toàn cho các cơ quan chức năng nhà nước (113, 114, 115).", label: "Nội dung Điều khoản sử dụng", group: "policy", type: "string" },
    { key: "privacy_policy_content", value: "1. Dữ liệu chúng tôi thu thập:\n- Thông tin tài khoản: Họ tên, Số điện thoại, Email và Ảnh đại diện.\n- Dữ liệu vị trí GPS thời gian thực khi sử dụng tính năng cứu hộ hoặc báo cáo cảnh báo.\n\n2. Mục đích sử dụng dữ liệu:\n- Tìm kiếm và kết nối Nạn nhân với Cứu hộ viên gần nhất.\n- Phát cảnh báo vùng nguy hiểm cho người dùng trong bán kính nguy cơ.\n\n3. Cam kết bảo mật:\n- Mọi thông tin cá nhân đều được mã hóa và bảo vệ theo tiêu chuẩn an toàn thông tin. Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại.", label: "Nội dung Chính sách bảo mật", group: "policy", type: "string" },
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
                `INSERT INTO ${this.settings.table} 
                    (${this.settings.field.settingKey}, ${this.settings.field.settingValue})
                 VALUES ($1, $2)
                 ON CONFLICT (${this.settings.field.settingKey}) 
                 DO UPDATE SET 
                     ${this.settings.field.settingValue} = EXCLUDED.${this.settings.field.settingValue},
                     ${this.settings.field.updatedAt} = CURRENT_TIMESTAMP;`,
                [key, String(values[key])]
            );
        }
    }
}

module.exports = new SettingsRepository();
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
