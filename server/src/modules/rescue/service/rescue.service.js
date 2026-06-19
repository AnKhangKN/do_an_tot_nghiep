const { transaction } = require("@/config/database.config");
const incident_typeService = require("@/modules/incident_type/service/incident_type.service");
const throwError = require("@/utils/throw_error.util");
const rescueRepository = require("../repository/rescue.repository");
const rescuer_locationService = require("@modules/location/service/rescuer_location.service")

class RescueService {
    constructor() {
        this.incident_typeService = incident_typeService;
        this.rescueRepository = rescueRepository;
        this.rescuer_locationService = rescuer_locationService;
    }

    addRescuerIncidentType = async (client, { userId, incidentTypeId }) => {

        const isRescuerIncidentTypeExists = await this.rescueRepository.rescuerIncidentTypeExists(client, { userId, incidentTypeId })

        if (isRescuerIncidentTypeExists) {
            throwError("Đã tồn tại sự cố này!", 400);
        }

        const createNewRescuerIncidentType = await this.rescueRepository.addNewRescuerIncidentType(client, { userId, incidentTypeId });

        return createNewRescuerIncidentType.rows[0];
    }

    rescueRegister = async ({
        userId, phone, gender, area, lat, lng, incidentTypeId
    }) => {
        return await transaction(async (client) => {

            // 1. Create rescuer
            const createNewRescuer =
                await this.rescueRepository.rescuerRegister(client, {
                    userId,
                    phone,
                    gender,
                    area
                });

            // 2. Update rescuer location
            const rescuerLocation = await this.rescuer_locationService.updateLocation(client, { userId, lat, lng })

            // 3. Add incident type
            const createNewRescuerIncidentType =
                await this.addRescuerIncidentType(client, {
                    userId,
                    incidentTypeId
                });

            // 4. Return result
            return {
                rescuer: createNewRescuer,
                incidentType: createNewRescuerIncidentType,
                rescuerLocation: rescuerLocation
            };
        })
    }
}

module.exports = new RescueService();