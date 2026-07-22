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
        activeSos: Number(summary?.active_sos || 0),
        completedSos: Number(summary?.completed_sos || 0),
        cancelledSos: Number(summary?.cancelled_sos || 0),
        totalIncidentTypes: Number(summary?.total_incident_types || 0),
      },
      statusBreakdown: statusBreakdown || [],
      incidentTypeStats: incidentTypeStats || [],
      dailyTrend: dailyTrend || [],
      recentRequests: recentRequests || [],
    };
  };
}

module.exports = new AdminService();
