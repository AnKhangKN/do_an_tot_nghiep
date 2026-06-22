const { transaction } = require("@/config/database.config");
const incident_typeService = require("@/modules/incident_type/service/incident_type.service");
const throwError = require("@/utils/throw_error.util");
const rescuerRepository = require("../repository/rescuer.repository");
const rescuer_locationService = require("@modules/location/service/rescuer_location.service")
const userService = require("@modules/user/services/user.service")
const rescuerModel = require("../model/rescuer_profile.model");
const userModel = require("@modules/user/model/user.model");
const { mapFields } = require("@/utils/mapper.util");

class RescuerService {
    constructor() {
        this.incident_typeService = incident_typeService;
        this.rescuerRepository = rescuerRepository;
        this.rescuer_locationService = rescuer_locationService;
        this.userService = userService;
        this.rescuerModel = rescuerModel;
        this.userModel = userModel;
    }

    addRescuerIncidentType = async (client, { userId, incidentTypeId }) => {

        const isRescuerIncidentTypeExists = await this.rescuerRepository.rescuerIncidentTypeExists(client, { userId, incidentTypeId })

        if (isRescuerIncidentTypeExists) {
            throwError("Đã tồn tại sự cố này!", 400);
        }

        return await this.rescuerRepository.addNewRescuerIncidentType(client, { userId, incidentTypeId });

    }

    rescuerRegister = async ({
        userId, phone, gender, area, incidentTypeId
    }) => {
        return await transaction(async (client) => {


            // 1. Create rescuer
            const createNewRescuer =
                await this.rescuerRepository.rescuerRegister(client, {
                    userId,
                    gender,
                    area
                });

            const addPhone = await this.userService.updatePhone(client, { userId, phone });

            // 2. Add incident type
            const createNewRescuerIncidentType =
                await this.addRescuerIncidentType(client, {
                    userId,
                    incidentTypeId
                });

            // 3. Return result
            return {
                rescuer: createNewRescuer,
                incidentType: createNewRescuerIncidentType,
                addPhone: addPhone
            };
        })
    }

    // Admin
    getRescuer = async ({ page, limit }) => {
        const rows = await this.rescuerRepository.getRescuer({ page, limit });

        return {
            data: rows.data.map(row => ({
                ...mapFields(row, this.userModel),
                ...mapFields(row, this.rescuerModel)
            })),
            total: rows.total,
            page: rows.page,
            totalPages: rows.totalPages
        } // trả về camelCase nhiều field
    }

    // Admin
    isVerifiedRescuer = async ({ userId }) => {

    }

    // Admin
    getRescuerDetail = async () => {

    }

    goOnline = async ({ userId }) => {
        const status = "ACTIVE"

        return await this.rescuerRepository.updateStatus({ userId, status });
    }

    updateLastSeen = async ({ userId }) => {
        return await this.rescuerRepository.updateLastSeen({userId})
    }
}

module.exports = new RescuerService();