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

  createUser = async (client, { email, fullName, phone, avatarUrl, isVerified = false }) => {
    const userId = generateUUID();
    const finalFullName = fullName || email.split("@")[0];

    const rows = await this.userRepository.createUser(client, {
      userId,
      fullName: finalFullName,
      email,
      phone,
      avatarUrl,
      isVerified,
    });

    return mapFields(rows, this.userModel);
  };

  updateGoogleProfile = async (client, { userId, fullName, avatarUrl, isVerified = true }) => {
    const rows = await this.userRepository.updateGoogleProfile(client, { userId, fullName, avatarUrl, isVerified });
    return rows ? mapFields(rows, this.userModel) : null;
  };

  findUserByPhone = async (client, { phone, excludeUserId }) => {
    const rows = await this.userRepository.findUserByPhone(client, { phone, excludeUserId });
    return rows ? mapFields(rows, this.userModel) : null;
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

  updateAvatar = async (client, { userId, avatarUrl }) => {
    if (!avatarUrl) {
      const err = new Error("URL hình ảnh đại diện không được để trống!");
      err.statusCode = 400;
      throw err;
    }

    const updatedUser = await this.userRepository.updateAvatar(client, { userId, avatarUrl });
    if (!updatedUser) {
      const err = new Error("Không tìm thấy thông tin người dùng!");
      err.statusCode = 404;
      throw err;
    }

    return mapFields(updatedUser, this.userModel);
  }

  updateProfile = async (client, { userId, fullName, phone }) => {
    if (!fullName || !fullName.toString().trim()) {
      const err = new Error("Họ và tên không được để trống!");
      err.statusCode = 400;
      throw err;
    }

    const cleanFullName = fullName.toString().trim();

    let cleanPhone = null;
    if (phone && phone.toString().trim()) {
      cleanPhone = phone.toString().trim();

      // Kiểm tra xem số điện thoại đã thuộc về tài khoản khác chưa
      const existingUser = await this.userRepository.findUserByPhone(client, {
        phone: cleanPhone,
        excludeUserId: userId,
      });

      if (existingUser) {
        const err = new Error("Số điện thoại này đã được sử dụng bởi một tài khoản khác. Vui lòng nhập đúng số điện thoại của bạn!");
        err.statusCode = 400;
        throw err;
      }
    }

    const updatedUser = await this.userRepository.updateProfile(client, { userId, fullName: cleanFullName, phone: cleanPhone });
    if (!updatedUser) {
      const err = new Error("Không tìm thấy thông tin người dùng!");
      err.statusCode = 404;
      throw err;
    }

    return mapFields(updatedUser, this.userModel);
  }


  updateIsVerified = async (client, { email, isVerified = true }) => {
    const updatedUser = await this.userRepository.updateIsVerified(client, { email, isVerified });
    return updatedUser ? mapFields(updatedUser, this.userModel) : null;
  };

  getUsersAdmin = async ({ page, limit }) => {
    const result = await this.userRepository.getUsersAdmin({ page, limit });
    return {
      data: result.data.map(row => mapFields(row, this.userModel)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  findActiveAdminUser = async () => {
    const row = await this.userRepository.findActiveAdminUser();
    return row ? mapFields(row, this.userModel) : null;
  }
}

module.exports = new UserService();