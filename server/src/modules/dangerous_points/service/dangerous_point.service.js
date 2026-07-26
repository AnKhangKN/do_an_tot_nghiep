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

        return mapFields(row, this.dangerousPointModel)
    }

    async getDangerousPointsAdmin({ page, limit }) {
        return await this.dangerousPointRepository.getDangerousPointsAdmin({ page, limit })
    }

    async getApprovedDangerousPoints() {
        return await this.dangerousPointRepository.getApprovedDangerousPoints()
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
}

module.exports = new DangerousPointService()
