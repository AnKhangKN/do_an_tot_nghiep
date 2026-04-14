const userService = require('./user.service');

class UserController {
    constructor() {
        this.userService = userService
    }

    getUserInfoById = async (req, res, next) => {
        try {
            const userId = req.userId;

            const user = await this.userService.getUserInfoById({ userId });

            console.log("Thông tin user: ", user);

            res.status(200).json(
                {
                    success: true,
                    message: "Get user info successfully",
                    data: user
                });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = new UserController();