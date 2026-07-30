const throwError = require("@/utils/throw_error.util");
const { transaction } = require("@/config/database.config");
const appealRepository = require("../repository/appeal.repository");
const userRepository = require("@modules/user/repository/user.repository");
const adminRepository = require("@modules/admin/repository/admin.repository");

class AppealService {
    constructor() {
        this.appealRepository = appealRepository;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    submit = async ({ userId, reason }) => {
        return await transaction(async (client) => {
            const user = await this.userRepository.getUserInfoById({ userId });

            if (!user) {
                throwError("Người dùng không tồn tại!", 404);
            }

            if (user.status !== "BANNED") {
                throwError("Tài khoản của bạn không bị khóa nên không cần kháng cáo!", 400);
            }

            const existing = await this.appealRepository.findPendingByUserId(client, { userId });
            if (existing) {
                throwError("Bạn đã gửi đơn kháng cáo trước đó, vui lòng chờ xử lý!", 400);
            }

            return await this.appealRepository.create(client, { userId, reason: reason.trim() });
        });
    };

    getAll = async ({ page, limit, status }) => {
        return await this.appealRepository.findAll({ page, limit, status });
    };

    approve = async ({ appealId, adminId, adminNote }) => {
        return await transaction(async (client) => {
            const appeal = await this.appealRepository.findById(appealId);
            if (!appeal) {
                throwError("Đơn kháng cáo không tồn tại!", 404);
            }
            if (appeal.status !== "PENDING") {
                throwError("Đơn kháng cáo này đã được xử lý!", 400);
            }

            await this.adminRepository.unbanUser(client, { userId: appeal.user_id });

            return await this.appealRepository.resolve(client, {
                id: appealId,
                status: "APPROVED",
                adminNote: adminNote || null,
                handledBy: adminId,
            });
        });
    };

    reject = async ({ appealId, adminId, adminNote }) => {
        return await transaction(async (client) => {
            const appeal = await this.appealRepository.findById(appealId);
            if (!appeal) {
                throwError("Đơn kháng cáo không tồn tại!", 404);
            }
            if (appeal.status !== "PENDING") {
                throwError("Đơn kháng cáo này đã được xử lý!", 400);
            }

            if (!adminNote || !adminNote.trim()) {
                throwError("Vui lòng nhập lý do từ chối!", 400);
            }

            return await this.appealRepository.resolve(client, {
                id: appealId,
                status: "REJECTED",
                adminNote: adminNote.trim(),
                handledBy: adminId,
            });
        });
    };
}

module.exports = new AppealService();
