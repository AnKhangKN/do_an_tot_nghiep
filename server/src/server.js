const app = require("./app");
const { connectDB } = require("@config/database.config");
const { PORT } = require("./config/env.config");

connectDB();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
