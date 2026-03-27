const { generateUUID } = require("@/utils/generate_uuid.util");
const userRepository = require("./user.repository");

class UserService {
  constructor() {
    this.user = userRepository;
  }

  exists = async (client, { email }) => {
    return await this.user.exists(client, { email });
  };

  createUser = async (client, { email }) => {
    const userId = generateUUID();
    const fullName = email.split("@")[0];

    return await this.user.createUser(client, {
      userId,
      fullName,
      email,
    });
  };
}

module.exports = new UserService();