const { generateUUID } = require("@/utils/generate_uuid.util");
const userAuthRepository = require("./user_auth.repository");
const { hashPassword } = require("@/utils/hash_password.util");
const { mapFields } = require("@/utils/mapper.util");
const user_authModel = require("./user_auth.model");

class UserAuthService {
    constructor() {
        this.userAuth = userAuthRepository;
        this.user_authModel = user_authModel;
    }

    createUserAuth = async (client, {
        userId,
        provider,
        providerId,
        password,
    }) => {

        const userAuthId = generateUUID();

        const hash = await hashPassword(password)

        const rows = await this.userAuth.createUserAuth(client, {
            userAuthId,
            userId,
            provider,
            providerId,
            password: hash,
        });

        return mapFields(rows, this.user_authModel)
    };

    getPasswordByUserId = async (client, { userId }) => {
        
        const rows = await this.userAuth.getPasswordByUserId(client, { userId });
        return mapFields(rows, this.user_authModel);
    }
}

module.exports = new UserAuthService();