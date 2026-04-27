class LocationService {
    // Tìm kiếm địa chỉ dựa trên từ khóa 
    searchLocations = (query) => {
    }
    
    // Lấy địa chỉ từ tọa độ (lat, lng)
    reverseGeocode = (lat, lng) => {
    }

    // Cập nhật vị trí hiện tại của người dùng (nếu có sẳn địa chỉ sẽ cập nhật, nếu không sẽ lưu tọa độ)
    updateCurrentLocation = (userId, lat, lng) => {
    }

    // Lấy vị trí hiện tại của người dùng (nếu có địa chỉ sẽ trả về địa chỉ, nếu không sẽ trả về tọa độ)
    getUserCurrentLocation = (userId) => {
    }

    // Tìm kiếm địa điểm gần vị trí hiện tại của người dùng (vd: bệnh viện, nhà thuốc, trạm xăng, ...)
    searchNearby = (keyword, lat, lng) => {
    }
}

module.exports = new LocationService();