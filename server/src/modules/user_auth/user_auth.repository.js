const user_authModel = require("./user_auth.model");

class UserAuthRepository {
  constructor() {
    this.userAuth = user_authModel;
  }

  createUserAuth = async (client, {
    userAuthId,
    userId,
    provider,
    providerId,
    password,
  }) => {
    const query = `
      INSERT INTO ${this.userAuth.table}
      (
        ${this.userAuth.field.userAuthId},
        ${this.userAuth.field.userId},
        ${this.userAuth.field.provider},
        ${this.userAuth.field.providerId},
        ${this.userAuth.field.password}
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await client.query(query, [
      userAuthId,
      userId,
      provider,
      providerId,
      password,
    ]);

    return result.rows[0];
  };
}

module.exports = new UserAuthRepository();
