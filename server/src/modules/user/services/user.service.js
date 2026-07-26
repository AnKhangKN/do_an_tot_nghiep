const { generateUUID } = require("@/utils/uuid.util");
const userRepository = require("../repository/user.repository");
const userModel = require('../model/user.model');
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

  getUserAuthInfo = async (client, { userId }) => {
    const rows = await this.userRepository.getUserAuthInfo(client, { userId });
    return mapFields(rows, this.userModel);
  }

  getUserIdByEmail = async (client, { email }) => {

    const rows = await this.userRepository.getUserIdByEmail(client, { email });
    return mapFields(rows, this.userModel);
  };



  getUserInfoById = async ({ userId }) => {

    const rows = await this.userRepository.getUserInfoById({ userId });
    return mapFields(rows, this.userModel);
  }

  updatePhone = async (client, { userId, phone }) => {
    if (!phone || !phone.toString().trim()) {
      const err = new Error("Số điện thoại không được để trống!");
      err.statusCode = 400;
      throw err;
    }

    const cleanPhone = phone.toString().trim();

    // Kiểm tra xem số điện thoại đã thuộc về tài khoản khác chưa
    const existingUser = await this.userRepository.findUserByPhone(client, {
      phone: cleanPhone,
      excludeUserId: userId,
    });

    if (existingUser) {
      const err = new Error("Số điện thoại này đã được sử dụng bởi một tài khoản khác. Vui lòng nhập đúng số điện thoại của bạn để người cứu hộ liên lạc!");
      err.statusCode = 400;
      throw err;
    }

    return await this.userRepository.updatePhone(client, { userId, phone: cleanPhone });
  }

  updateRole = async (client, { userId, role }) => {
    return await this.userRepository.updateRole(client, { userId, role });
  }

  getUsersAdmin = async ({ page, limit }) => {
    const result = await this.userRepository.getUsersAdmin({ page, limit });
    return {
      data: result.data.map(row => mapFields(row, this.userModel)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }
}

module.exports = new UserService();