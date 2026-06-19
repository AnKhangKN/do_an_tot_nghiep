const rescuer_locationModel = require("../model/rescuer_location.model")

class RescuerLocationRepository {
    constructor() { 
        this.rescuer_locationModel = rescuer_locationModel
     }

    updateLocation = async (client, { userId, lat, lng }) => {
        const query = `
            INSERT INTO ${this.rescuer_locationModel.table} (
                ${this.rescuer_locationModel.field.userId},
                ${this.rescuer_locationModel.field.lat},
                ${this.rescuer_locationModel.field.lng}
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (${this.rescuer_locationModel.field.userId})
            DO UPDATE SET
                ${this.rescuer_locationModel.field.lat} = EXCLUDED.${this.rescuer_locationModel.field.lat},
                ${this.rescuer_locationModel.field.lng} = EXCLUDED.${this.rescuer_locationModel.field.lng},
                ${this.rescuer_locationModel.field.updatedAt} = NOW()
            
            RETURNING *;
        `;

        const result = await client.query(query, [userId, lat, lng]);
        return result.rows[0]
    };
}

module.exports = new RescuerLocationRepository();
