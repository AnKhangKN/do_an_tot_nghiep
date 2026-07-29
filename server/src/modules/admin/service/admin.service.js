const adminRepository = require("../repository/admin.repository");

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
