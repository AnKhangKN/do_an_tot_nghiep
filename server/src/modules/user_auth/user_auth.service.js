const { generateUUID } = require("@/utils/generate_uuid.util");
const userAuthRepository = require("./user_auth.repository");
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

        const hash = await hashPassword(password)

        return await this.userAuth.createUserAuth(client, {
            userAuthId,
            userId,
            provider,
            providerId,
            password: hash,
        });
    };
}

module.exports = new UserAuthService();