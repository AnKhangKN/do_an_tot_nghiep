const { pool } = require("@/config/database.config");
const emergencyAmenityModel = require("../model/emergency_amenity.model");
const amenityCategoryModel = require("../model/amenity_category.model");
const { mapFields } = require("@utils/mapper.util");

class EmergencyAmenityRepository {
    constructor() {
        this.model = emergencyAmenityModel;
        this.categoryModel = amenityCategoryModel;
    }

    async getApprovedAmenities({ amenityCategoryId }) {
        let query = `
            SELECT 
                ea.*,
                ac.category_name,
                ac.icon_name,
                img.url as image_url
            FROM ${this.model.table} ea
            JOIN ${this.categoryModel.table} ac ON ea.${this.model.field.amenityCategoryId} = ac.${this.categoryModel.field.amenityCategoryId}
            LEFT JOIN LATERAL (
                SELECT url FROM images
                WHERE entity_type = 'EMERGENCY_AMENITY' AND entity_id = ea.${this.model.field.amenityId}
                ORDER BY created_at DESC
                LIMIT 1
            ) img ON true
            WHERE ea.${this.model.field.status} = 'APPROVED'
              AND ac.${this.categoryModel.field.status} = 'ACTIVE'
        `;
        const params = [];
        if (amenityCategoryId) {
            params.push(amenityCategoryId);
            query += ` AND ea.${this.model.field.amenityCategoryId} = $1`;
        }
        query += ` ORDER BY ea.${this.model.field.createdAt} DESC`;

        const { rows } = await pool.query(query, params);
        return rows.map(row => ({
            ...mapFields(row, this.model),
            categoryName: row.category_name,
            iconName: row.icon_name,
            imageUrl: row.image_url || null
        }));
    }

    async getAmenitiesByReporter(userId) {
        const query = `
            SELECT 
                ea.*,
                ac.category_name,
                ac.icon_name,
                img.url as image_url
            FROM ${this.model.table} ea
            JOIN ${this.categoryModel.table} ac ON ea.${this.model.field.amenityCategoryId} = ac.${this.categoryModel.field.amenityCategoryId}
            LEFT JOIN LATERAL (
                SELECT url FROM images
                WHERE entity_type = 'EMERGENCY_AMENITY' AND entity_id = ea.${this.model.field.amenityId}
                ORDER BY created_at DESC
                LIMIT 1
            ) img ON true
            WHERE ea.${this.model.field.reportedBy} = $1
            ORDER BY ea.${this.model.field.createdAt} DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows.map(row => ({
            ...mapFields(row, this.model),
            categoryName: row.category_name,
            iconName: row.icon_name,
            imageUrl: row.image_url || null
        }));
    }


    async createAmenity(data) {
        const query = `
            INSERT INTO ${this.model.table} (
                ${this.model.field.amenityId},
                ${this.model.field.amenityCategoryId},
                ${this.model.field.phone},
                ${this.model.field.latitude},
                ${this.model.field.longitude},
                ${this.model.field.openingHours},
                ${this.model.field.status},
                ${this.model.field.reportedBy},
                ${this.model.field.approvedBy}
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const params = [
            data.amenityId,
            data.amenityCategoryId,
            data.phone || null,
            data.latitude,
            data.longitude,
            data.openingHours || '07:00 - 21:00',
            data.status || 'PENDING',
            data.reportedBy || null,
            data.approvedBy || null
        ];
        const { rows } = await pool.query(query, params);
        return mapFields(rows[0], this.model);
    }

    async getAmenitiesAdmin({ page = 1, limit = 20, status, categoryId }) {
        const offset = (page - 1) * limit;
        let whereClause = `WHERE 1=1`;
        const params = [];

        if (status) {
            params.push(status);
            whereClause += ` AND ea.${this.model.field.status} = $${params.length}`;
        }

        if (categoryId) {
            params.push(categoryId);
            whereClause += ` AND ea.${this.model.field.amenityCategoryId} = $${params.length}`;
        }

        const dataParams = [...params, limit, offset];
        const query = `
            SELECT 
                ea.*,
                ac.category_name,
                ac.icon_name,
                img.url as image_url,
                u_reporter.full_name as reporter_name
            FROM ${this.model.table} ea
            JOIN ${this.categoryModel.table} ac ON ea.${this.model.field.amenityCategoryId} = ac.${this.categoryModel.field.amenityCategoryId}
            LEFT JOIN LATERAL (
                SELECT url FROM images
                WHERE entity_type = 'EMERGENCY_AMENITY' AND entity_id = ea.${this.model.field.amenityId}
                ORDER BY created_at DESC
                LIMIT 1
            ) img ON true
            LEFT JOIN users u_reporter ON ea.${this.model.field.reportedBy} = u_reporter.user_id
            ${whereClause}
            ORDER BY ea.${this.model.field.createdAt} DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM ${this.model.table} ea
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, dataParams),
            pool.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        return {
            data: dataResult.rows.map(row => ({
                ...mapFields(row, this.model),
                categoryName: row.category_name,
                iconName: row.icon_name,
                imageUrl: row.image_url || null,
                reporterName: row.reporter_name || (row.reported_by ? 'Người dùng' : 'Hệ thống')
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };

    }

    async updateStatus({ amenityId, status, approvedBy }) {
        const query = `
            UPDATE ${this.model.table}
            SET ${this.model.field.status} = $1,
                ${this.model.field.approvedBy} = $2,
                ${this.model.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.model.field.amenityId} = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [status, approvedBy, amenityId]);
        return rows[0] ? mapFields(rows[0], this.model) : null;
    }

    async deleteAmenity(amenityId) {
        const query = `
            DELETE FROM ${this.model.table}
            WHERE ${this.model.field.amenityId} = $1
            RETURNING *
        `;
        const { rows } = await pool.query(query, [amenityId]);
        return rows.length > 0;
    }

    /// Quét phát hiện các cặp tiện ích nghi ngờ trùng lặp (trùng SĐT hoặc cùng danh mục trong bán kính radiusMeters)
    async findDuplicatePairs(radiusMeters = 200) {
        const query = `
            SELECT 
                ea1.amenity_id as primary_id,
                ea1.phone as primary_phone,
                ea1.latitude as primary_lat,
                ea1.longitude as primary_lng,
                ea1.opening_hours as primary_hours,
                ea1.status as primary_status,
                ea1.created_at as primary_created_at,
                ac1.category_name as primary_category_name,
                img1.url as primary_image_url,
                
                ea2.amenity_id as duplicate_id,
                ea2.phone as duplicate_phone,
                ea2.latitude as duplicate_lat,
                ea2.longitude as duplicate_lng,
                ea2.opening_hours as duplicate_hours,
                ea2.status as duplicate_status,
                ea2.created_at as duplicate_created_at,
                ac2.category_name as duplicate_category_name,
                img2.url as duplicate_image_url,

                (6371000 * 2 * ASIN(SQRT(
                    POWER(SIN(RADIANS(ea2.latitude - ea1.latitude) / 2), 2) +
                    COS(RADIANS(ea1.latitude)) * COS(RADIANS(ea2.latitude)) *
                    POWER(SIN(RADIANS(ea2.longitude - ea1.longitude) / 2), 2)
                ))) AS distance_meters,
                
                CASE 
                    WHEN ea1.phone IS NOT NULL AND ea1.phone = ea2.phone THEN 'MATCH_PHONE'
                    WHEN ea1.amenity_category_id = ea2.amenity_category_id THEN 'MATCH_LOCATION_CATEGORY'
                    ELSE 'MATCH_LOCATION'
                END AS match_reason
            FROM emergency_amenities ea1
            JOIN emergency_amenities ea2 ON ea1.amenity_id < ea2.amenity_id
            JOIN amenity_categories ac1 ON ea1.amenity_category_id = ac1.amenity_category_id
            JOIN amenity_categories ac2 ON ea2.amenity_category_id = ac2.amenity_category_id
            LEFT JOIN LATERAL (
                SELECT url FROM images
                WHERE entity_type = 'EMERGENCY_AMENITY' AND entity_id = ea1.amenity_id
                ORDER BY created_at DESC
                LIMIT 1
            ) img1 ON true
            LEFT JOIN LATERAL (
                SELECT url FROM images
                WHERE entity_type = 'EMERGENCY_AMENITY' AND entity_id = ea2.amenity_id
                ORDER BY created_at DESC
                LIMIT 1
            ) img2 ON true
            WHERE (
                (ea1.phone IS NOT NULL AND ea1.phone = ea2.phone)
                OR (
                    ea1.amenity_category_id = ea2.amenity_category_id 
                    AND (6371000 * 2 * ASIN(SQRT(
                        POWER(SIN(RADIANS(ea2.latitude - ea1.latitude) / 2), 2) +
                        COS(RADIANS(ea1.latitude)) * COS(RADIANS(ea2.latitude)) *
                        POWER(SIN(RADIANS(ea2.longitude - ea1.longitude) / 2), 2)
                    ))) <= $1
                )
            )
            ORDER BY distance_meters ASC
            LIMIT 50
        `;

        const { rows } = await pool.query(query, [radiusMeters]);
        return rows.map(r => ({
            primary: {
                amenityId: r.primary_id,
                categoryName: r.primary_category_name,
                phone: r.primary_phone,
                latitude: parseFloat(r.primary_lat),
                longitude: parseFloat(r.primary_lng),
                openingHours: r.primary_hours,
                status: r.primary_status,
                createdAt: r.primary_created_at,
                imageUrl: r.primary_image_url || null
            },
            duplicate: {
                amenityId: r.duplicate_id,
                categoryName: r.duplicate_category_name,
                phone: r.duplicate_phone,
                latitude: parseFloat(r.duplicate_lat),
                longitude: parseFloat(r.duplicate_lng),
                openingHours: r.duplicate_hours,
                status: r.duplicate_status,
                createdAt: r.duplicate_created_at,
                imageUrl: r.duplicate_image_url || null
            },
            distanceMeters: Math.round(parseFloat(r.distance_meters)),
            matchReason: r.match_reason === 'MATCH_PHONE' 
                ? 'Trùng số điện thoại' 
                : r.match_reason === 'MATCH_LOCATION_CATEGORY'
                ? `Cùng loại tiện ích trong bán kính ${Math.round(parseFloat(r.distance_meters))}m`
                : `Vị trí lân cận ${Math.round(parseFloat(r.distance_meters))}m`
        }));
    }

    /// Gộp 2 tiện ích: Chuyển ảnh & feedback sang primaryAmenityId, sau đó xóa duplicateAmenityId
    async mergeAmenities(client, primaryAmenityId, duplicateAmenityId) {
        // 1. Chuyển ảnh đính kèm
        await client.query(
            `UPDATE images SET entity_id = $1 WHERE entity_id = $2 AND entity_type = 'EMERGENCY_AMENITY'`,
            [primaryAmenityId, duplicateAmenityId]
        );

        // 2. Chuyển feedbacks
        await client.query(
            `UPDATE amenity_feedbacks SET amenity_id = $1 WHERE amenity_id = $2`,
            [primaryAmenityId, duplicateAmenityId]
        );

        // 3. Xóa bản ghi phụ trùng lặp
        await client.query(
            `DELETE FROM emergency_amenities WHERE amenity_id = $1`,
            [duplicateAmenityId]
        );

        return true;
    }
}

module.exports = new EmergencyAmenityRepository();
