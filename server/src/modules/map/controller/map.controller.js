const mapService = require("../service/map.service");

class MapController {
    async searchLocations(req, res, next) {
        try {
            const { query, limit } = req.validatedQuery;
            const results = await mapService.searchLocations({
                query,
                limit,
                userId: req.userId
            });

            return res.status(200).json({
                success: true,
                message: "Tìm kiếm địa điểm thành công!",
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MapController();
