const { generateUUID } = require("@/utils/generate_uuid.util");
const userRepository = require("./user.repository");
const userModel = require('./user.model');
const { mapFields } = require("@/utils/mapper.util");

class UserService {
  constructor() {
    this.userRepository = userRepository;
    this.userModel = userModel;
  }

  exists = async (client, { email }) => {
    return await this.userRepository.exists(client, { email });
  };

  createUser = async (client, { email }) => {
    const userId = generateUUID();
    const fullName = email.split("@")[0];

    const rows = await this.userRepository.createUser(client, {
      userId,
      fullName,
      email,
    });

    return mapFields(rows, this.userModel);
  };

  getUserIdByEmail = async (client, { email }) => {

    const rows = await this.userRepository.getUserIdByEmail(client, { email });
    return mapFields(rows, this.userModel);
  };

  getUserInfoById = async ({ userId }) => {

    const rows = await this.userRepository.getUserInfoById({ userId });
    return mapFields(rows, this.userModel);
  }
}

module.exports = new UserService();