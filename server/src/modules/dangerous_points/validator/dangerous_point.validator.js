const throwError = require("@/utils/throw_error.util")

const validatorCreateDangerousPoint = async (req, res, next) => {
    const { zoneName, latitude, longitude, dangerLevel } = req.body

    if (!zoneName?.trim()) {
        throwError("Tên khu vực không được rỗng!", 400)
    }

    if (latitude === undefined || longitude === undefined) {
        throwError("Vĩ độ và kinh độ không được rỗng!", 400)
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throwError("Vĩ độ và kinh độ phải là số!", 400)
    }

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(dangerLevel)) {
        throwError("Mức độ nguy hiểm không hợp lệ!", 400)
    }

    next()
}

module.exports = {
    validatorCreateDangerousPoint
}
