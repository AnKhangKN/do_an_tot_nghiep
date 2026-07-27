const validatorCreateAmenity = (req, res, next) => {
    const { amenityCategoryId, latitude, longitude } = req.body;

    if (!amenityCategoryId) {
        return res.status(400).json({
            success: false,
            message: "Danh mục tiện ích không được để trống"
        });
    }

    if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
            success: false,
            message: "Tọa độ vị trí (latitude, longitude) không hợp lệ"
        });
    }

    next();
};

const validatorCategory = (req, res, next) => {
    const { categoryName } = req.body;
    if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({
            success: false,
            message: "Tên danh mục không được để trống"
        });
    }
    next();
};

module.exports = {
    validatorCreateAmenity,
    validatorCategory
};
