const { generateUUID } = require('@/utils/uuid.util')
const dangerousPointRepository = require('../repository/dangerous_point.repository')
const { mapFields } = require('@utils/mapper.util')
const dangerousPointModel = require("../model/dangerous_point.model")
const { transaction } = require("@/config/database.config")

class DangerousPointService {
    constructor() {
        this.dangerousPointRepository = dangerousPointRepository
        this.dangerousPointModel = dangerousPointModel
    }

    async createDangerousPoint({ zoneName, address, description, latitude, longitude, dangerLevel, reportedBy }) {
        const textContent = [zoneName, address, description].filter(Boolean).join(" - ");
        if (textContent) {
            const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
            const spamCheck = await aiModerationService.checkKnownSpamText(textContent);
            if (spamCheck.isBlocked) {
                throw new Error(`Báo cáo điểm nguy hiểm bị từ chối: ${spamCheck.reason || "Nội dung chứa từ ngữ vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const dangerousPointId = generateUUID()

        const row = await transaction(async (client) => {
            return await this.dangerousPointRepository.createDangerousPoint(client, {
                dangerousPointId,
                zoneName,
                address,
                description,
                latitude,
                longitude,
                dangerLevel,
                reportedBy
            })
        })

        if (textContent) {
            const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
            aiModerationService.processModerationAsync("DANGEROUS_POINT", dangerousPointId, textContent);
        }

        return mapFields(row, this.dangerousPointModel)
    }

    async getDangerousPointsAdmin({ page, limit }) {
        return await this.dangerousPointRepository.getDangerousPointsAdmin({ page, limit })
    }

    async getApprovedDangerousPoints() {
        return await this.dangerousPointRepository.getApprovedDangerousPoints()
    }

    async getMyDangerousPoints(userId) {
        return await this.dangerousPointRepository.getDangerousPointsByReporter(userId);
    }

    async approveDangerousPoint({ dangerousPointId, approvedBy }) {
        const updatedPoint = await transaction(async (client) => {
            return await this.dangerousPointRepository.updateStatus(client, {
                dangerousPointId,
                status: 'APPROVED',
                approvedBy
            })
        })

        return updatedPoint ? mapFields(updatedPoint, this.dangerousPointModel) : null
    }

    async rejectDangerousPoint({ dangerousPointId }) {
        const updatedPoint = await transaction(async (client) => {
            return await this.dangerousPointRepository.updateStatus(client, {
                dangerousPointId,
                status: 'REJECTED'
            })
        })

        return updatedPoint ? mapFields(updatedPoint, this.dangerousPointModel) : null
    }

    /// Tự động quét và phát hiện các điểm nguy hiểm từ cụm dữ liệu SOS (Crowd-Sourced)
    async autoDetectAndCreateCrowdSourcedZones() {
        const clusters = await this.dangerousPointRepository.detectSosClusters(200, 3);
        let createdCount = 0;

        for (const cluster of clusters) {
            const exists = await this.dangerousPointRepository.findNearbyDangerousPoint(
                cluster.avgLat,
                cluster.avgLng,
                300
            );

            if (!exists) {
                const dangerousPointId = generateUUID();
                const dangerLevel = cluster.sosCount >= 5 ? 'HIGH' : 'MEDIUM';
                const zoneName = `Điểm nóng SOS (Tự động phát hiện ${cluster.sosCount} ca)`;
                const address = `Khu vực có mật độ cứu hộ cao (${cluster.avgLat.toFixed(4)}, ${cluster.avgLng.toFixed(4)})`;
                const description = `Hệ thống phân tích dữ liệu tự động ghi nhận ${cluster.sosCount} ca SOS phát sinh trong bán kính 200m. Cần Admin kiểm duyệt.`;

                await transaction(async (client) => {
                    await this.dangerousPointRepository.createSystemDangerousPoint(client, {
                        dangerousPointId,
                        zoneName,
                        address,
                        description,
                        latitude: cluster.avgLat,
                        longitude: cluster.avgLng,
                        dangerLevel
                    });
                });
                createdCount++;
            }
        }

        return { createdCount, totalClustersFound: clusters.length };
    }

    /// Gửi phản hồi / xác minh trạng thái cho một điểm nguy hiểm (người dùng & cứu hộ viên)
    async createFeedback({ dangerousPointId, userId, feedbackType, comment }) {
        const validTypes = ['VERIFY_REAL', 'REPORT_FAKE', 'MARKED_RESOLVED', 'STILL_DANGEROUS'];
        if (!validTypes.includes(feedbackType)) {
            throw new Error(`Loại phản hồi '${feedbackType}' không hợp lệ.`);
        }

        const point = await this.dangerousPointRepository.getDangerousPointById(dangerousPointId);
        if (!point) {
            throw new Error("Không tìm thấy điểm cảnh báo/nguy hiểm yêu cầu.");
        }

        if (comment && comment.trim()) {
            const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
            const spamCheck = await aiModerationService.checkKnownSpamText(comment.trim());
            if (spamCheck.isBlocked) {
                throw new Error(`Ghi chú phản hồi bị từ chối: ${spamCheck.reason || "Nội dung ghi chú chứa từ ngữ vi phạm tiêu chuẩn cộng đồng."}`);
            }
        }

        const feedbackId = generateUUID();
        const feedback = await transaction(async (client) => {
            return await this.dangerousPointRepository.createFeedback(client, {
                feedbackId,
                dangerousPointId,
                userId,
                feedbackType,
                comment: comment ? comment.trim() : null
            });
        });

        if (comment && comment.trim()) {
            const aiModerationService = require("@modules/ai_moderation/service/ai_moderation.service");
            aiModerationService.processModerationAsync("DANGEROUS_POINT_FEEDBACK", feedbackId, comment.trim());
        }

        const stats = await this.dangerousPointRepository.getFeedbackStatsByPointId(dangerousPointId);

        return {
            feedback,
            stats
        };
    }

    /// Lấy thống kê số lượt xác minh của một điểm nguy hiểm
    async getFeedbackStatsByPointId(dangerousPointId) {
        return await this.dangerousPointRepository.getFeedbackStatsByPointId(dangerousPointId);
    }

    /// Lấy danh sách phản hồi chi tiết của một điểm nguy hiểm
    async getFeedbacksByPointId(dangerousPointId, { page = 1, limit = 10 } = {}) {
        return await this.dangerousPointRepository.getFeedbacksByPointId(dangerousPointId, { page, limit });
    }

    /// Lấy danh sách phản hồi điểm nguy hiểm cho Admin
    async getFeedbacksAdmin({ page, limit }) {
        return await this.dangerousPointRepository.getFeedbacksAdmin({
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20
        });
    }
}

module.exports = new DangerousPointService()
