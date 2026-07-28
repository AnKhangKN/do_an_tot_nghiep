const { generateUUID } = require('@/utils/uuid.util');
const incident_typeRepository = require('../repository/incident_type.repository');
const { mapFields } = require('@utils/mapper.util');
const incident_typeModel = require("../model/incident_type.model");
const throwError = require('@utils/throw_error.util');

class IncidentTypeService {
    constructor() {
        this.incident_typeRepository = incident_typeRepository;
        this.incident_typeModel = incident_typeModel;
    }

    createIncidentType = async ({ incidentType }) => {
        if (!incidentType || !incidentType.trim()) {
            throwError("Tên loại sự cố không được để trống!", 400);
        }

        // Tự động IN HOA tên loại sự cố trước khi ghi vào DB
        const upperIncidentType = incidentType.trim().toUpperCase();
        const incidentTypeId = generateUUID();

        const row = await this.incident_typeRepository.createIncidentType({
            incidentTypeId,
            incidentType: upperIncidentType
        });
        return mapFields(row, this.incident_typeModel);
    };

    updateIncidentType = async ({ incidentTypeId, incidentType, status }) => {
        if (!incidentTypeId) {
            throwError("Thiếu ID loại sự cố!", 400);
        }

        // Tự động IN HOA tên loại sự cố nếu có chỉnh sửa
        const upperIncidentType = incidentType ? incidentType.trim().toUpperCase() : undefined;

        const updated = await this.incident_typeRepository.updateIncidentType({
            incidentTypeId,
            incidentType: upperIncidentType,
            status
        });

        if (!updated) {
            throwError("Không tìm thấy loại sự cố để cập nhật!", 404);
        }

        return updated;
    };

    toggleStatus = async ({ incidentTypeId, status }) => {
        if (!incidentTypeId) {
            throwError("Thiếu ID loại sự cố!", 400);
        }

        const validStatuses = ["ACTIVE", "INACTIVE"];
        const newStatus = status ? status.toUpperCase() : "ACTIVE";
        if (!validStatuses.includes(newStatus)) {
            throwError("Trạng thái sự cố không hợp lệ!", 400);
        }

        const updated = await this.incident_typeRepository.toggleStatus({
            incidentTypeId,
            status: newStatus
        });

        if (!updated) {
            throwError("Không tìm thấy loại sự cố!", 404);
        }

        return updated;
    };

    getIncidentTypeAdmin = async ({ page, limit }) => {
        const rows = await this.incident_typeRepository.getIncidentTypeAdmin({ page, limit });

        return {
            data: rows.data.map((row) => mapFields(row, this.incident_typeModel)),
            total: rows.total,
            page: rows.page,
            totalPages: rows.totalPages
        };
    };

    getIncidentType = async () => {
        return this.incident_typeRepository.getIncidentType();
    };
}

module.exports = new IncidentTypeService();