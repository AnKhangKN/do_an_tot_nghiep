const { pool } = require("@/config/database.config");
const rescuer_locationModel = require("../model/rescuer_location.model")

class RescuerLocationRepository {
    constructor() { 
        this.rescuer_locationModel = rescuer_locationModel
     }

    updateLocation = async ({ userId, lat, lng, geohash }) => {
        const query = `
            INSERT INTO ${this.rescuer_locationModel.table} (
                ${this.rescuer_locationModel.field.userId},
                ${this.rescuer_locationModel.field.lat},
                ${this.rescuer_locationModel.field.lng},
                ${this.rescuer_locationModel.field.geohash}
            )
            
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (${this.rescuer_locationModel.field.userId})
            DO UPDATE SET
                ${this.rescuer_locationModel.field.lat} = EXCLUDED.${this.rescuer_locationModel.field.lat},
                ${this.rescuer_locationModel.field.lng} = EXCLUDED.${this.rescuer_locationModel.field.lng},
                ${this.rescuer_locationModel.field.geohash} = EXCLUDED.${this.rescuer_locationModel.field.geohash},
                ${this.rescuer_locationModel.field.updatedAt} = NOW()
            
            RETURNING *;
        `;

        const result = await pool.query(query, [userId, lat, lng, geohash]);
        return result.rows[0]
    };
}

module.exports = new RescuerLocationRepository();
