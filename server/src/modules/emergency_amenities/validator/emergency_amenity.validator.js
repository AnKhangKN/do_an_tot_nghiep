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

const AMENITY_ICONS = ["medical", "fire", "police", "gas", "repair", "shelter", "food", "store"];

const ICON_ALIASES = {
    "wrench": "repair",
    "gas-pump": "gas",
    "first-aid": "medical",
    "tire": "repair"
};

const normalizeIconName = (iconName) => {
    if (!iconName || typeof iconName !== "string") return "store";
    const value = iconName.trim().toLowerCase();
    if (AMENITY_ICONS.includes(value)) return value;
    if (ICON_ALIASES[value]) return ICON_ALIASES[value];
    return null;
};

const validatorCategory = (req, res, next) => {
    const { categoryName, iconName } = req.body;
    if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({
            success: false,
            message: "Tên danh mục không được để trống"
        });
    }

    const normalizedIcon = normalizeIconName(iconName);
    if (normalizedIcon === null) {
        return res.status(400).json({
            success: false,
            message: "Biểu tượng danh mục không hợp lệ"
        });
    }
    req.body.iconName = normalizedIcon;

    next();
};

module.exports = {
    validatorCreateAmenity,
    validatorCategory
};
