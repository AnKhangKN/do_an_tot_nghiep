const imageModel = require("../model/image.model");
const { pool } = require("@config/database.config");

class ImageRepository {
    constructor() {
        this.model = imageModel;
    }

    createImage = async (client, { imageId, url, entityType, entityId }) => {
        const db = client || pool;
        const query = `
            INSERT INTO ${this.model.table} (
                ${this.model.field.imageId},
                ${this.model.field.url},
                ${this.model.field.entityType},
                ${this.model.field.entityId}
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await db.query(query, [imageId, url, entityType, entityId]);
        return rows[0];
    }
}

module.exports = new ImageRepository();