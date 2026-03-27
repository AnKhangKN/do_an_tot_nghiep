const { generateUUID } = require("@/utils/generate_uuid.util");
const userAuthRepository = require("./user_auth.repository");
const throwError = require("@/utils/throw_error.util");
const { hashPassword } = require("@/utils/hash_password.util");

class UserAuthService {
    constructor() {
        this.userAuth = userAuthRepository;
    }

    createUserAuth = async (client, {
        userId,
        provider,
        providerId,
        password,
    }) => {

        const userAuthId = generateUUID();

        const hashPassword = hashPassword(password)

        return await this.userAuth.createUserAuth(client, {
            userAuthId,
            userId,
            provider,
            providerId,
            password: hashPassword,
        });
    };
}

module.exports = new UserAuthService();