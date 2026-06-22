const userModel = {
    table: "users",
    field: {
        userId: "user_id",
        fullName: "full_name",
        email: "email",
        phone: "phone",
        role: "role",

        isVerified: "is_verified", // Xác thực tài khoản

        status: "status",
        avatarUrl: "avatar_url",
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
};

module.exports = userModel;