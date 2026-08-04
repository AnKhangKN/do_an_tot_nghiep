const throwError = require("@/utils/throw_error.util");
const { transaction } = require("@/config/database.config");
const appFeedbackRepository = require("../repository/app_feedback.repository");
const userRepository = require("@modules/user/repository/user.repository");

class AppFeedbackService {
    constructor() {
        this.appFeedbackRepository = appFeedbackRepository;
        this.userRepository = userRepository;
    }

    // User gửi báo cáo ứng dụng
    create = async ({ userId, category, title, content }) => {
        return await transaction(async (client) => {
            const user = await this.userRepository.getUserInfoById({ userId });
            if (!user) {
                throwError("Người dùng không tồn tại!", 404);
            }

            return await this.appFeedbackRepository.create(client, {
                userId,
                category,
                title,
                content,
            });
        });
    };

    // Lịch sử báo cáo của user
    getMy = async ({ userId, page, limit }) => {
        return await this.appFeedbackRepository.findByUserId(userId, { page, limit });
    };

    // Admin: danh sách báo cáo
    getAll = async ({ page, limit, status, category, search }) => {
        return await this.appFeedbackRepository.findAllAdmin({ page, limit, status, category, search });
    };

    // Admin: thống kê
    getStats = async () => {
        return await this.appFeedbackRepository.getStats();
    };

    // Admin cập nhật trạng thái xử lý
    updateStatus = async ({ id, status, adminNote, handledBy }) => {
        return await transaction(async (client) => {
            const feedback = await this.appFeedbackRepository.findById(id);
            if (!feedback) {
                throwError("Báo cáo ứng dụng không tồn tại!", 404);
            }

            if (status === "REJECTED" && (!adminNote || !adminNote.trim())) {
                throwError("Vui lòng nhập ghi chú khi từ chối báo cáo!", 400);
            }

            return await this.appFeedbackRepository.updateStatus(client, {
                id,
                status,
                adminNote: adminNote || null,
                handledBy,
            });
        });
    };
}

module.exports = new AppFeedbackService();
