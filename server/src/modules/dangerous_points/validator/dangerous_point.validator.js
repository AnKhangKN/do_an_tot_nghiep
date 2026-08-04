const throwError = require("@/utils/throw_error.util")

const validatorCreateDangerousPoint = async (req, res, next) => {
    const { zoneName, dangerLevel } = req.body

    if (!zoneName?.trim()) {
        throwError("Tên khu vực không được rỗng!", 400)
    }

    const lat = typeof req.body.latitude === 'number' ? req.body.latitude : parseFloat(req.body.latitude);
    const lng = typeof req.body.longitude === 'number' ? req.body.longitude : parseFloat(req.body.longitude);

    if (isNaN(lat) || isNaN(lng)) {
        throwError("Vĩ độ và kinh độ phải là số hợp lệ!", 400)
    }

    req.body.latitude = lat;
    req.body.longitude = lng;

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(dangerLevel)) {
        throwError("Mức độ nguy hiểm không hợp lệ!", 400)
    }

    next()
}

module.exports = {
    validatorCreateDangerousPoint
}
