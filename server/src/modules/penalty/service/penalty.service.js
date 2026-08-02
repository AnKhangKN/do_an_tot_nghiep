const redis = require("@config/redis.config");
const penaltyModel = require("../model/penalty.model");
const userRepository = require("@modules/user/repository/user.repository");
const { sendEmail } = require("@utils/mail.service");

const LADDER = penaltyModel.ladder;
const PERMANENT_STREAK = LADDER[LADDER.length - 1].streak;

const lockHoursByStreak = (streak) => {
    const rung = LADDER.find((r) => r.streak === streak);
    return rung ? rung.hours : null;
};

class PenaltyService {
    // Đếm số lần hủy liên tiếp và áp dụng hình phạt theo thang 2 → 4 → 6 → 8
    trackCancelPenalty = async ({ userId, role }) => {
        try {
            const streakKey = penaltyModel.streakKey(userId);
            const streak = await redis.incr(streakKey);
            await redis.expire(streakKey, penaltyModel.streakTtlSeconds);

            console.log(`[PENALTY] ${role} ${userId} đã hủy lần thứ ${streak} liên tiếp`);

            // Cấm vĩnh viễn khi đạt 8 lần hủy liên tiếp
            if (streak >= PERMANENT_STREAK) {
                await redis.del(streakKey);
                const reason = role === 'RESCUER'
                    ? "Bạn đã bị khóa vĩnh viễn do hủy quá nhiều ca cứu hộ liên tiếp (8 lần) mà không hoàn thành ca nào."
                    : "Bạn đã bị khóa vĩnh viễn do hủy quá nhiều ca cứu hộ liên tiếp (8 lần) mà không hoàn thành ca nào.";
                await this.banPermanently({ userId, role, streak });
                return { streak, level: null, banned: true, reason, blockedUntil: null };
            }

            const hours = lockHoursByStreak(streak);
            if (hours === null) {
                return { streak, level: null, banned: false, reason: null, blockedUntil: null };
            }

            const blockedUntil = Date.now() + hours * 60 * 60 * 1000;
            const reason = this._buildLockReason({ role, streak, hours });
            const lockInfo = {
                role,
                streak,
                level: hours,
                reason,
                blockedUntil: new Date(blockedUntil).toISOString()
            };

            const lockKey = role === 'RESCUER'
                ? penaltyModel.rescuerLockKey(userId)
                : penaltyModel.victimLockKey(userId);
            await redis.set(lockKey, JSON.stringify(lockInfo), "EX", hours * 60 * 60);

            if (role === 'RESCUER') {
                const rescuerService = require("@modules/rescuer/service/rescuer.service");
                await rescuerService.suspendRescuer({ userId });
                await redis.publish("rescuer:suspended", JSON.stringify({
                    rescuerId: userId,
                    reason,
                    level: hours,
                    blockedUntil
                }));
            } else {
                await redis.publish("victim:cancel_blocked", JSON.stringify({
                    victimId: userId,
                    reason,
                    level: hours,
                    blockedUntil
                }));
            }

            console.log(`[PENALTY] ${role} ${userId} bị tạm khóa ${hours} giờ do hủy ${streak} lần liên tiếp`);
            return { streak, level: hours, banned: false, reason, blockedUntil };
        } catch (err) {
            console.error(`[PENALTY] Lỗi xử lý phạt ${role} hủy ca:`, err);
            return { streak: 0, level: null, banned: false, reason: null, blockedUntil: null };
        }
    };

    // Reset bộ đếm hủy liên tiếp khi có một ca cứu hộ hoàn thành
    resetCancelStreak = async ({ userId }) => {
        try {
            if (!userId) return;
            await redis.del(penaltyModel.streakKey(userId));
            console.log(`[PENALTY] Đã reset bộ đếm hủy ca liên tiếp cho user: ${userId}`);
        } catch (err) {
            console.error("[PENALTY] Lỗi reset streak:", err);
        }
    };

    // Kiểm tra user có đang bị tạm khóa do hủy ca liên tiếp không
    getCancelBlock = async ({ userId, role }) => {
        const key = role === 'RESCUER'
            ? penaltyModel.rescuerLockKey(userId)
            : penaltyModel.victimLockKey(userId);
        const raw = await redis.get(key);
        if (!raw) {
            return { blocked: false, reason: null, blockedUntil: null, level: null };
        }
        try {
            const info = JSON.parse(raw);
            return {
                blocked: true,
                reason: info.reason,
                blockedUntil: info.blockedUntil,
                level: info.level
            };
        } catch (err) {
            return { blocked: true, reason: null, blockedUntil: null, level: null };
        }
    };

    _buildLockReason = ({ role, streak, hours }) => {
        if (role === 'RESCUER') {
            return `Bạn đã hủy ${streak} ca cứu hộ liên tiếp. Tài khoản bị tạm khóa nhận ca cứu hộ mới trong ${hours} giờ.`;
        }
        return `Bạn đã hủy ${streak} ca cứu hộ liên tiếp. Tạm khóa gửi yêu cầu cứu hộ mới trong ${hours} giờ.`;
    };

    banPermanently = async ({ userId, role, streak }) => {
        try {
            const adminService = require("@modules/admin/service/admin.service");
            const reason = role === 'RESCUER'
                ? "Tài khoản của bạn đã bị khóa vĩnh viễn do hủy quá nhiều ca cứu hộ liên tiếp (8 lần) mà không hoàn thành ca nào, gây ảnh hưởng nghiêm trọng đến hệ thống cứu hộ."
                : "Tài khoản của bạn đã bị khóa vĩnh viễn do hủy quá nhiều ca cứu hộ liên tiếp (8 lần) mà không hoàn thành ca nào, gây ảnh hưởng nghiêm trọng đến hệ thống cứu hộ.";

            // adminService.banUser sẽ cập nhật DB + phát sự kiện socket "user:banned" cho app
            await adminService.banUser(userId, {
                reason,
                bannedBy: userId
            });

            // Gửi email cảnh báo tới người dùng
            const user = await userRepository.getUserInfoById({ userId });
            if (user && user.email) {
                await sendEmail({
                    to: user.email,
                    subject: "[CỨU HỘ SOS] Tài khoản của bạn đã bị khóa vĩnh viễn",
                    html: `
                        <h2>Cảnh báo hủy quá nhiều ca cứu hộ</h2>
                        <p>Xin chào ${user.full_name || ""},</p>
                        <p>Bạn đã hủy ${streak} ca cứu hộ liên tiếp trong thời gian ngắn mà chưa hoàn thành ca cứu hộ nào.</p>
                        <p>Hành vi này gây ảnh hưởng rất lớn tới hệ thống cứu hộ và những người gặp nạn đang cần trợ giúp.</p>
                        <p>Tài khoản của bạn đã bị <strong>khóa vĩnh viễn</strong>.</p>
                        <p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
                        <p>Trân trọng,<br/>Hệ Thống Cứu Hộ SOS</p>
                    `
                });
            }
            console.log(`[PENALTY] ${role} ${userId} đã bị cấm vĩnh viễn do hủy ${streak} lần liên tiếp`);
        } catch (err) {
            console.error("[PENALTY] Lỗi banPermanently:", err);
        }
    };
}

module.exports = new PenaltyService();
