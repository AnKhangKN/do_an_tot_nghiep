const throwError = require("@utils/throw_error.util");
const userEntity = require("@modules/user/user.entity");
const { hashPassword } = require("@utils/hash_password.util");
const { generateUUID } = require("@/utils/generate_uuid.util");

class AuthService {
    constructor() {
        this.userEntity = userEntity;
    }

    register = async ({
        email,
        password,
        provider,
        providerId,
    }) => {
        const exists = await this.userEntity.exists(email);

        if (exists) {
            throwError("Người dùng đã tồn tại!", 400);
        }

        const userId = generateUUID();
        const fullName = email.split("@")[0];

        const userAuthId = generateUUID();

        let pw = null;

        if (provider === "EMAIL") {
            pw = await hashPassword(password);
        }

        if (provider === "GOOGLE" && !providerId) {
            throwError("Thiếu Google ID", 400);
        }

        const entity = await this.userEntity.createUser({
            userId,
            fullName,
            email,
            userAuthId,
            provider,
            providerId,
            password: pw,
        });

        return entity;
    };
}

module.exports = new AuthService();