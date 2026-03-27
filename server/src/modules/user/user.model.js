const userModel = {
    table: "users",
    field: {
        userId: "user_id",
        fullName: "full_name",
        email: "email",
        phone: "phone",

        // Quyền ADMIN | VICTIM | RESCUER
        role: "role", 

        // ONLINE | OFFLINE
        status: "status",

        avatarUrl: "avatar_url",
        isVerified: "is_verified",

        // Cập nhật khi nhấn vị trí của tôi hoặc gửi request
        currentLatitude: "current_latitude",
        currentLongitude: "current_longitude",

        createdAt: "created_at",
        updatedAt: "updated_at"
    },
};

module.exports = userModel;
