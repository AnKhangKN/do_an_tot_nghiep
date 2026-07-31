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

            // 1. Kiểm tra nếu đã bị từ chối 3 lần => Khóa vĩnh viễn
            const rejectedCount = await this.appealRepository.countRejectedByUserId(client, { userId });
            if (rejectedCount >= 3) {
                throwError("Tài khoản của bạn đã bị khóa vĩnh viễn do bị từ chối kháng cáo 3 lần vì vi phạm chính sách ứng dụng.", 403);
            }

            // 2. Kiểm tra nếu đã có 3 đơn PENDING => Chặn spam
            const pendingCount = await this.appealRepository.countPendingByUserId(client, { userId });
            if (pendingCount >= 3) {
                throwError("Bạn đã có 3 yêu cầu kháng cáo đang chờ xử lý. Vui lòng chờ Ban quản trị xét duyệt trước khi gửi thêm!", 400);
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

            const resolved = await this.appealRepository.resolve(client, {
                id: appealId,
                status: "REJECTED",
                adminNote: adminNote.trim(),
                handledBy: adminId,
            });

            // Sau khi từ chối, đếm số lần từ chối của người dùng. Nếu >= 3 lần => Cập nhật ban_reason vĩnh viễn
            const rejectedCount = await this.appealRepository.countRejectedByUserId(client, { userId: appeal.user_id });
            if (rejectedCount >= 3) {
                await this.appealRepository.updateUserPermanentBanReason(client, {
                    userId: appeal.user_id,
                    banReason: "Tài khoản của bạn đã bị khóa vĩnh viễn do bị từ chối kháng cáo 3 lần vì vi phạm chính sách ứng dụng.",
                });
            }

            return resolved;
        });
    };

    getAppealStatus = async ({ userId }) => {
        const user = await this.userRepository.getUserInfoById({ userId });
        if (!user) {
            throwError("Người dùng không tồn tại!", 404);
        }

        const pendingCount = await this.appealRepository.countPendingByUserId(null, { userId });
        const rejectedCount = await this.appealRepository.countRejectedByUserId(null, { userId });

        const isPermanentlyBanned = rejectedCount >= 3 || (user.ban_reason && user.ban_reason.includes("khóa vĩnh viễn"));
        const canAppeal = user.status === "BANNED" && !isPermanentlyBanned && pendingCount < 3;

        let message = null;
        if (isPermanentlyBanned) {
            message = "Tài khoản của bạn đã bị khóa vĩnh viễn do bị từ chối kháng cáo 3 lần vì vi phạm chính sách ứng dụng.";
        } else if (pendingCount >= 3) {
            message = "Bạn đã có 3 yêu cầu kháng cáo đang chờ xử lý. Vui lòng chờ Ban quản trị xét duyệt trước khi gửi thêm.";
        }

        return {
            isBanned: user.status === "BANNED",
            banReason: user.ban_reason,
            pendingCount,
            rejectedCount,
            canAppeal,
            isPermanentlyBanned,
            message,
        };
    };
}

module.exports = new AppealService();
