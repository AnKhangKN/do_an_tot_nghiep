require("module-alias/register");

const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("@/routes");
const errorHandler = require("./middlewares/error_handler.middleware");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
