const { pool } = require("@/config/database.config");
const amenityCategoryModel = require("../model/amenity_category.model");
const { mapFields } = require("@utils/mapper.util");

class AmenityCategoryRepository {
    constructor() {
        this.model = amenityCategoryModel;
    }

    async getActiveCategories() {
        const query = `
            SELECT * FROM ${this.model.table}
            WHERE ${this.model.field.status} = 'ACTIVE' OR ${this.model.field.status} IS NULL OR ${this.model.field.status} = ''
            ORDER BY ${this.model.field.categoryName} ASC
        `;
        const { rows } = await pool.query(query);
        return rows.map(r => mapFields(r, this.model));
    }

    async getAllCategoriesAdmin() {
        const query = `
            SELECT * FROM ${this.model.table}
            ORDER BY ${this.model.field.createdAt} DESC
        `;
        const { rows } = await pool.query(query);
        return rows.map(r => mapFields(r, this.model));
    }

    async createCategory({ amenityCategoryId, categoryName, iconName, status }) {
        const query = `
            INSERT INTO ${this.model.table}
                (${this.model.field.amenityCategoryId}, ${this.model.field.categoryName}, ${this.model.field.iconName}, ${this.model.field.status})
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [
            amenityCategoryId,
            categoryName,
            iconName || 'store',
            status || 'ACTIVE'
        ]);
        return mapFields(rows[0], this.model);
    }

    async updateCategory({ amenityCategoryId, categoryName, iconName, status }) {
        const query = `
            UPDATE ${this.model.table}
            SET ${this.model.field.categoryName} = $1,
                ${this.model.field.iconName} = $2,
                ${this.model.field.status} = $3,
                ${this.model.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.model.field.amenityCategoryId} = $4
            RETURNING *
        `;
        const { rows } = await pool.query(query, [categoryName, iconName, status, amenityCategoryId]);
        return rows[0] ? mapFields(rows[0], this.model) : null;
    }
}

module.exports = new AmenityCategoryRepository();
