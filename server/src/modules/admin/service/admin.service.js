const adminRepository = require("../repository/admin.repository");
const userRepository = require("@/modules/user/repository/user.repository");
const userService = require("@/modules/user/services/user.service");
const userAuthService = require("@/modules/user_auth/service/user_auth.service");
const { comparePassword } = require("@/utils/password.util");
const { transaction } = require("@/config/database.config");
const { getIO } = require("@/socket");

class AdminService {
  getDashboardOverview = async (days = 7) => {
    const [summary, statusBreakdown, incidentTypeStats, dailyTrend, recentRequests] = await Promise.all([
      adminRepository.getSummaryStats(),
      adminRepository.getSosStatusBreakdown(),
      adminRepository.getIncidentTypeStats(),
      adminRepository.getDailySosStats(days),
      adminRepository.getRecentSosRequests(6),
    ]);

    return {
      summary: {
        totalUsers: Number(summary?.total_users || 0),
        totalRescuers: Number(summary?.total_rescuers || 0),
        pendingRescuers: Number(summary?.pending_rescuers || 0),
        totalSos: Number(summary?.total_sos || 0),
        todaySos: Number(summary?.today_sos || 0),
        activeSos: Number(summary?.active_sos || 0),
        completedSos: Number(summary?.completed_sos || 0),
        cancelledSos: Number(summary?.cancelled_sos || 0),
        matchedSos: Number(summary?.matched_sos || 0),
        matchingSuccessRate: Number(summary?.total_sos || 0) > 0 
          ? Math.round((Number(summary?.matched_sos || 0) / Number(summary?.total_sos || 1)) * 100) 
          : 0,
        totalIncidentTypes: Number(summary?.total_incident_types || 0),
      },
      statusBreakdown: statusBreakdown || [],
      incidentTypeStats: incidentTypeStats || [],
      dailyTrend: dailyTrend || [],
      recentRequests: recentRequests || [],
    };
  };

  getSosHeatmap = async () => {
    const rawPoints = await adminRepository.getSosHeatmapPoints();
    const now = new Date();

    return rawPoints.map(p => {
      const createdAt = p.created_at ? new Date(p.created_at) : now;
      const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);

      // Trọng số động (Intensity): Ca đang diễn ra có trọng số cao nhất (1.0)
      let weight = 0.5;
      if (['PENDING', 'SEARCHING', 'ASSIGNED', 'IN_PROGRESS'].includes(p.status)) {
        weight = 1.0;
      } else if (daysDiff <= 7) {
        weight = 0.85;
      } else if (daysDiff <= 30) {
        weight = 0.65;
      } else {
        weight = 0.4;
      }

      return {
        sosRequestId: p.sos_request_id,
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng),
        status: p.status,
        incidentType: p.incident_type || "Cứu hộ khẩn cấp",
        createdAt: p.created_at,
        intensity: weight,
      };
    });
  };

  getAiActivitySummary = async (days = 7) => {
    const overview = await this.getDashboardOverview(days);
    const summaryStats = overview.summary;
    const topCategory = overview.incidentTypeStats?.[0]?.name || "Y TẾ";

    const aiClassifierService = require("@utils/ai_classifier.service");
    return await aiClassifierService.summarizeActivityLogs({
      timeframeDays: days,
      stats: {
        totalSos: summaryStats.totalSos,
        completedSos: summaryStats.completedSos,
        cancelledSos: summaryStats.cancelledSos,
        activeRescuers: summaryStats.totalRescuers,
        topIncidentCategory: topCategory
      }
    });
  };

  banUser = async (userId, { reason, bannedBy }) => {
    const user = await userRepository.getUserInfoById({ userId });
    if (!user) {
      throw { status: 404, message: "Người dùng không tồn tại!" };
    }
    if (user.role === "ADMIN") {
      throw { status: 400, message: "Không thể khóa tài khoản Admin!" };
    }
    if (user.status === "BANNED") {
      throw { status: 400, message: "Người dùng này đã bị khóa trước đó!" };
    }

    const result = await transaction(async (client) => {
      return await adminRepository.banUser(client, { userId, reason, bannedBy });
    });

    const io = getIO();
    if (io) {
      io.to(`user:${userId}`).emit("user:banned", {
        reason,
        bannedAt: new Date().toISOString(),
      });
    }

    return result;
  };

  unbanUser = async (userId) => {
    const user = await userRepository.getUserInfoById({ userId });
    if (!user) {
      throw { status: 404, message: "Người dùng không tồn tại!" };
    }
    if (user.status !== "BANNED") {
      throw { status: 400, message: "Người dùng này hiện không bị khóa!" };
    }

    return await transaction(async (client) => {
      return await adminRepository.unbanUser(client, { userId });
    });
  };

  getBannedUsers = async ({ page, limit }) => {
    return await adminRepository.getBannedUsers({ page, limit });
  };

  getAdminProfile = async (userId) => {
    const user = await userService.getUserInfoById({ userId });
    if (!user) {
      throw { status: 404, message: "Không tìm thấy thông tin Admin!" };
    }
    return user;
  };

  updateAdminProfile = async (userId, { fullName, phone }) => {
    return await transaction(async (client) => {
      return await userService.updateProfile(client, { userId, fullName, phone });
    });
  };

  updateAdminAvatar = async (userId, avatarUrl) => {
    if (!avatarUrl) {
      throw { status: 400, message: "Vui lòng chọn hình ảnh để tải lên làm ảnh đại diện!" };
    }
    return await userService.updateAvatar(null, { userId, avatarUrl });
  };

  changeAdminPassword = async (userId, { currentPassword, newPassword }) => {
    return await transaction(async (client) => {
      const authRecord = await userAuthService.getPasswordByUserId(client, { userId });
      if (!authRecord || !authRecord.password) {
        throw { status: 400, message: "Tài khoản này không có mật khẩu (đăng nhập bằng Google)!" };
      }

      const isMatch = await comparePassword(currentPassword, authRecord.password);
      if (!isMatch) {
        throw { status: 400, message: "Mật khẩu hiện tại không đúng!" };
      }

      return await userAuthService.updatePassword(client, { userId, password: newPassword });
    });
  };

  getAppeals = async ({ page, limit, status }) => {
    return await adminRepository.getAppeals({ page, limit, status });
  };

  approveAppeal = async (appealId, reviewerId) => {
    const appeal = await adminRepository.getAppealById(appealId);
    if (!appeal) {
      throw { status: 404, message: "Không tìm thấy yêu cầu kháng cáo!" };
    }
    if (appeal.status !== 'PENDING') {
      throw { status: 400, message: "Yêu cầu kháng cáo này đã được xử lý trước đó!" };
    }

    const result = await transaction(async (client) => {
      await adminRepository.unbanUser(client, { userId: appeal.user_id });
      return await adminRepository.updateAppealStatus(client, appealId, 'APPROVED', reviewerId);
    });

    const user = await userRepository.getUserInfoById({ userId: appeal.user_id });

    const { sendEmail } = require("@utils/mail.service");
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #d9534f; margin: 0; font-size: 26px;">HỆ THỐNG CỨU HỘ SOS</h1>
          <p style="color: #666666; font-size: 14px; margin-top: 5px;">Kháng cáo tài khoản</p>
        </div>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">&#10004;</div>
          <h2 style="color: #16a34a; margin: 0 0 10px 0;">Yêu cầu kháng cáo đã được chấp thuận!</h2>
          <p style="font-size: 15px; color: #333333; margin: 0;">
            Tài khoản <strong>${user.full_name || user.email}</strong> của bạn đã được mở khóa.
          </p>
          <p style="font-size: 14px; color: #666666; margin-top: 10px;">
            Bạn có thể đăng nhập lại và sử dụng ứng dụng bình thường.
          </p>
        </div>
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ quản trị viên.</p>
          <p>© 2026 Hệ Thống Cứu Hộ SOS Khẩn Cấp. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "[CỨU HỘ SOS] Yêu cầu kháng cáo của bạn đã được chấp thuận!",
        html: emailContent
      });
    } catch (e) {
      console.error("Không thể gửi email thông báo mở khóa:", e.message);
    }

    return result;
  };

  rejectAppeal = async (appealId, reviewerId, rejectReason) => {
    const appeal = await adminRepository.getAppealById(appealId);
    if (!appeal) {
      throw { status: 404, message: "Không tìm thấy yêu cầu kháng cáo!" };
    }
    if (appeal.status !== 'PENDING') {
      throw { status: 400, message: "Yêu cầu kháng cáo này đã được xử lý trước đó!" };
    }

    const result = await transaction(async (client) => {
      return await adminRepository.updateAppealStatus(client, appealId, 'REJECTED', reviewerId, rejectReason);
    });

    return result;
  };

  exportOperationalReportCsv = async (days = 30) => {
    const rows = await adminRepository.getExportSosData(days);

    const statusMap = {
      DONE: "Hoàn thành",
      CANCELLED: "Đã hủy",
      IN_PROGRESS: "Đang cứu hộ",
      ASSIGNED: "Đã tiếp nhận",
      SEARCHING: "Đang tìm cứu hộ",
      PENDING: "Chờ xử lý"
    };

    // UTF-8 BOM để Excel hiển thị không bị lỗi font tiếng Việt
    let csv = "\uFEFFMã Ca SOS,Nạn Nhân,Số Điện Thoại,Loại Sự Cố,Trạng Thái,Cứu Hộ Viên,SĐT Cứu Hộ,Tọa Độ GPS,Thời Gian Tạo,Cập Nhật Lần Cuối\n";

    rows.forEach(r => {
      const sosId = r.sos_request_id ? `"${r.sos_request_id}"` : '""';
      const victim = r.victim_name ? `"${r.victim_name.replace(/"/g, '""')}"` : '"Chưa cập nhật"';
      const phone = r.victim_phone ? `"${r.victim_phone}"` : '""';
      const incident = r.incident_type ? `"${r.incident_type.replace(/"/g, '""')}"` : '"Cứu hộ khẩn cấp"';
      const statusStr = `"${statusMap[r.status] || r.status}"`;
      const rescuer = r.rescuer_name ? `"${r.rescuer_name.replace(/"/g, '""')}"` : '"Chưa có"';
      const rescuerPhone = r.rescuer_phone ? `"${r.rescuer_phone}"` : '""';
      const gps = (r.lat && r.lng) ? `"${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}"` : '"Chưa rõ"';
      const createdAt = r.created_at ? `"${new Date(r.created_at).toLocaleString('vi-VN')}"` : '""';
      const updatedAt = r.updated_at ? `"${new Date(r.updated_at).toLocaleString('vi-VN')}"` : '""';

      csv += `${sosId},${victim},${phone},${incident},${statusStr},${rescuer},${rescuerPhone},${gps},${createdAt},${updatedAt}\n`;
    });

    return csv;
  };
}

module.exports = new AdminService();
