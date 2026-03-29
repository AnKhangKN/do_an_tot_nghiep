const throwError = require("@/utils/throw_error.util")

const validatorIncidentType = async (req, res, next) => {
    const { incidentType } = req.body

    if (!incidentType?.trim()) {
        throwError("Loại sự cố không được rỗng!", 400)
    }

    next()
}

module.exports = {
    validatorIncidentType
}