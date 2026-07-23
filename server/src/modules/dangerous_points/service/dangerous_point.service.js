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
}

module.exports = new DangerousPointService()
