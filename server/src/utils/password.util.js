const bcrypt = require("bcrypt");
const throwError = require("./throw_error.util");

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    if (!password) {
        throwError("Password không được rỗng", 400);
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);

    return hash;
}

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword,
}