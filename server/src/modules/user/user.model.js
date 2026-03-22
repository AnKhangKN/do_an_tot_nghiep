const userModel = {
    table: "users",
    field: {
        userId: "user_id",
        fullName: "full_name",
        email: "email",
        password: "password",
        phone: "phone",

        role: "role",
        status: "status",

        avatarUrl: "avatar_url",
        isVerified: "is_verified",

        currentLatitude: "current_latitude",
        currentLongitude: "current_longitude",

        createdAt: "created_at",
        updatedAt: "updated_at"
    },
};

module.exports = userModel;
