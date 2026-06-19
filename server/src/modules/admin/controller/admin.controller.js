class UserAdminController {

    // admin dọn rác - xóa vĩnh viễn tài khoản rác
    hardDeleteUser = async (req, res, next) => { }

    // admin khóa tài khoản
    deactivateUser = async (req, res, next) => { }

    // admin mở khóa / khôi phục
    restoreUser = async (req, res, next) => { }
}

module.exports = new UserAdminController();